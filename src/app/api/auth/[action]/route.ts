import { NextResponse } from 'next/server';
import { serverEnv } from '@/shared/config/env';

/**
 * 인증 전용 BFF 프록시.
 *
 * 브라우저는 백엔드를 직접 부르지 않고 이 라우트를 거친다. 이유는 쿠키다.
 *
 * 백엔드는 Refresh 토큰을 `localhost:8080` 의 httpOnly 쿠키로 내려주는데,
 * 브라우저는 `localhost:3000` 에 있다. `SameSite=Lax` 쿠키는 교차 사이트 XHR 에
 * 실려 나가지 않으므로 재발급이 아예 동작하지 않는다.
 *
 * 이 라우트가 백엔드의 Set-Cookie 를 받아 **Next 오리진에 다시 굽는다.**
 * 그러면 쿠키가 1st-party 가 되어 브라우저가 알아서 붙여 보낸다.
 *
 * Access 토큰은 쿠키에 담지 않고 응답 바디로 넘겨 클라이언트 메모리에만 둔다.
 */

const BACKEND_COOKIE = 'refreshToken';

/** 프록시가 다시 굽는 쿠키. proxy.ts 가 존재 여부를 봐야 하므로 경로를 루트로 둔다. */
const SESSION_COOKIE = 'pius_session';

/** 백엔드의 Refresh 유효기간과 맞춘다 (14일). */
const MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

type Action = 'login' | 'refresh' | 'logout';

const ALLOWED: readonly Action[] = ['login', 'refresh', 'logout'];

function isAllowed(action: string): action is Action {
  return (ALLOWED as readonly string[]).includes(action);
}

/**
 * 백엔드가 내려준 Set-Cookie 에서 refreshToken 값을 뽑는다.
 *
 * 경로·만료 등 나머지 속성은 우리 오리진 기준으로 다시 정하므로 값만 있으면 된다.
 */
function extractRefreshToken(setCookie: string | null): string | null {
  if (!setCookie) return null;
  const match = new RegExp(`${BACKEND_COOKIE}=([^;]*)`).exec(setCookie);
  const value = match?.[1];
  return value ? value : null;
}

function sessionCookieOf(request: Request): string | null {
  const match = request.headers.get('cookie')?.match(new RegExp(`${SESSION_COOKIE}=([^;]*)`));
  return match?.[1] ?? null;
}

/**
 * 만료된 Access 토큰으로 로그아웃을 시도한 경우의 보정.
 *
 * 쿠키로 재발급받아 새 Access 토큰을 얻고 그것으로 다시 로그아웃한다.
 * 재발급마저 실패하면 이미 무효한 세션이므로 원래 응답을 그대로 쓴다.
 */
async function revokeWithFreshToken(
  apiInternalUrl: string,
  session: string,
  fallback: Response,
): Promise<Response> {
  const refreshed = await fetch(`${apiInternalUrl}/auth/refresh`, {
    method: 'POST',
    headers: { cookie: `${BACKEND_COOKIE}=${session}` },
    cache: 'no-store',
  });
  if (!refreshed.ok) return fallback;

  const payload = (await refreshed.json()) as { data?: { accessToken?: string } };
  const accessToken = payload.data?.accessToken;
  if (!accessToken) return fallback;

  const rotated = extractRefreshToken(refreshed.headers.get('set-cookie')) ?? session;
  return fetch(`${apiInternalUrl}/auth/logout`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      cookie: `${BACKEND_COOKIE}=${rotated}`,
    },
    cache: 'no-store',
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ action: string }> }) {
  // Next 16 에서 params 는 Promise 다.
  const { action } = await params;

  if (!isAllowed(action)) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_INPUT', message: '잘못된 요청입니다.' } },
      { status: 404 },
    );
  }

  const { apiInternalUrl } = serverEnv();
  const session = sessionCookieOf(request);

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  // 재발급·로그아웃은 우리 오리진 쿠키를 백엔드가 아는 이름으로 바꿔 전달한다.
  if (action !== 'login' && session) {
    headers.cookie = `${BACKEND_COOKIE}=${session}`;
  }
  // 로그아웃은 Bearer 토큰으로 대상을 식별한다.
  const authorization = request.headers.get('authorization');
  if (authorization) {
    headers.authorization = authorization;
  }

  const body = action === 'login' ? await request.text() : undefined;

  let upstream: Response;
  try {
    upstream = await fetch(`${apiInternalUrl}/auth/${action}`, {
      method: 'POST',
      headers,
      body,
      cache: 'no-store',
    });

    /*
     * 로그아웃이 401 이면 Access 토큰이 만료된 것이다. 쿠키만 지우고 끝내면
     * 서버의 Refresh 토큰이 살아남아, 그 값을 쥔 쪽은 계속 재발급할 수 있다.
     * 쿠키로 한 번 재발급해 새 토큰을 얻은 뒤 다시 로그아웃해 확실히 무효화한다.
     */
    if (action === 'logout' && upstream.status === 401 && session) {
      upstream = await revokeWithFreshToken(apiInternalUrl, session, upstream);
    }
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'NETWORK_ERROR', message: '서버에 연결할 수 없습니다.' },
      },
      { status: 502 },
    );
  }

  const text = await upstream.text();
  const response = text
    ? new NextResponse(text, {
        status: upstream.status,
        headers: { 'Content-Type': 'application/json' },
      })
    : new NextResponse(null, { status: upstream.status });

  if (action === 'logout') {
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  const refreshToken = extractRefreshToken(upstream.headers.get('set-cookie'));
  if (refreshToken) {
    response.cookies.set(SESSION_COOKIE, refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: MAX_AGE_SECONDS,
      // 로컬은 http 라 secure 를 붙이지 않는다. 배포 시 HTTPS 뒤에서 켠다.
      secure: process.env.NODE_ENV === 'production',
    });
  } else if (!upstream.ok) {
    // 재발급 실패 — 더 이상 쓸 수 없는 세션이므로 지운다.
    response.cookies.delete(SESSION_COOKIE);
  }

  return response;
}
