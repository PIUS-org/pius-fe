import { api, getAccessToken } from '@/shared/api/client';
import { ApiError, networkError } from '@/shared/api/error';
import type { ApiResponse } from '@/shared/api/types';
import type { AccountSummary, LoginResponse } from '@/entities/account/types';

/**
 * 인증 호출.
 *
 * 로그인 · 재발급 · 로그아웃은 백엔드가 아니라 **같은 오리진의 BFF 라우트**를 부른다.
 * Refresh 쿠키가 우리 오리진에 구워져야 브라우저가 자동으로 붙여 보내기 때문이다.
 * (`src/app/api/auth/[action]/route.ts` 참고)
 *
 * `me` 는 Bearer 토큰만 쓰므로 백엔드를 직접 부른다.
 */

async function callBff<T>(action: 'login' | 'refresh' | 'logout', body?: unknown): Promise<T> {
  const headers: Record<string, string> = {};
  if (body) headers['Content-Type'] = 'application/json';

  // 로그아웃은 Bearer 로 대상을 식별한다. 만료됐다면 BFF 가 쿠키로 보정한다.
  const token = getAccessToken();
  if (action === 'logout' && token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`/api/auth/${action}`, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (cause) {
    throw networkError(cause);
  }

  if (response.status === 204) return undefined as T;

  const parsed = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !parsed || parsed.success === false) {
    throw new ApiError(
      response.status,
      parsed && parsed.success === false
        ? parsed.error
        : { code: 'INTERNAL_ERROR', message: '일시적인 오류가 발생했습니다.' },
    );
  }
  return parsed.data;
}

export const authApi = {
  login: (loginId: string, password: string) =>
    callBff<LoginResponse>('login', { loginId, password }),

  refresh: () => callBff<LoginResponse>('refresh'),

  logout: () => callBff<void>('logout'),

  me: () => api.get<AccountSummary>('/auth/me'),
};
