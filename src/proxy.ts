import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next 16 의 미들웨어. 15 이하의 `middleware.ts` 가 이 이름으로 바뀌었다.
 *
 * 세션 쿠키의 **존재 여부만** 보고 로그인 화면으로 보낸다.
 * 토큰이 유효한지는 검사하지 않는다 — 그건 서버가 할 일이고, 여기서 흉내 내면
 * 두 곳의 판정이 어긋난다. 이 리다이렉트는 순전히 사용자 경험을 위한 것이다.
 */

const SESSION_COOKIE = 'pius_session';
const LOGIN_PATH = '/login';

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (pathname === LOGIN_PATH) {
    // 이미 로그인한 사람이 로그인 화면에 오면 앱으로 돌려보낸다.
    // 어디로 갈지는 권한에 따라 다르므로 루트가 판단한다.
    return hasSession ? NextResponse.redirect(new URL('/', request.url)) : NextResponse.next();
  }

  if (!hasSession) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    // 로그인 후 원래 가려던 곳으로 돌려보낸다.
    if (pathname !== '/') {
      loginUrl.searchParams.set('next', `${pathname}${search}`);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  /*
   * 정적 파일과 API 라우트는 건드리지 않는다.
   * 특히 /api/auth 를 막으면 로그인 자체가 불가능해진다.
   */
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)',
  ],
};
