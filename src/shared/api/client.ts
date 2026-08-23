import { env } from '@/shared/config/env';
import { ApiError, networkError } from './error';
import type { ApiResponse } from './types';

/**
 * 백엔드 호출 클라이언트.
 *
 * axios 대신 fetch 를 쓴다. Next 가 fetch 를 감싸 캐시·재검증을 붙여 두었고,
 * 필요한 것이 헤더 주입과 401 재발급뿐이라 라이브러리를 더할 이유가 없다.
 *
 * Access 토큰은 메모리에만 둔다. localStorage 에 넣으면 XSS 한 번으로 새 나간다.
 * 새로고침하면 사라지므로, 그때는 Refresh 쿠키로 다시 받아온다.
 */

let accessToken: string | null = null;

/** 401 을 만난 요청들이 동시에 재발급을 부르지 않도록 하나로 묶는다. */
let refreshPromise: Promise<boolean> | null = null;

/** 재발급 방법은 인증 기능이 주입한다 — client 가 auth 를 참조하면 순환이 된다. */
let refreshHandler: (() => Promise<boolean>) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function setRefreshHandler(handler: (() => Promise<boolean>) | null) {
  refreshHandler = handler;
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  /** multipart 업로드용. 지정하면 body 를 그대로 보내고 Content-Type 을 붙이지 않는다. */
  formData?: FormData;
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
  /** 재발급 재시도를 하지 않는다. 재발급 요청 자신이 쓴다. */
  skipRefresh?: boolean;
};

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(`${env.apiBaseUrl}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

async function parseBody<T>(response: Response): Promise<ApiResponse<T> | null> {
  if (response.status === 204) return null;
  try {
    return (await response.json()) as ApiResponse<T>;
  } catch {
    return null;
  }
}

async function once<T>(path: string, options: RequestOptions): Promise<T> {
  const { method = 'GET', body, formData, query, signal } = options;

  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
      signal,
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause;
    throw networkError(cause);
  }

  const parsed = await parseBody<T>(response);

  if (!response.ok) {
    if (parsed && parsed.success === false) {
      throw new ApiError(response.status, parsed.error);
    }
    throw new ApiError(response.status, {
      code: 'INTERNAL_ERROR',
      message: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    });
  }

  // 204 등 본문이 없는 성공 응답
  if (!parsed) return undefined as T;
  if (parsed.success === false) throw new ApiError(response.status, parsed.error);
  return parsed.data;
}

/**
 * 401 을 만나면 한 번만 재발급하고 원래 요청을 다시 보낸다.
 *
 * 재발급도 실패하면 그대로 던진다 — 화면이 로그인으로 보낸다.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  try {
    return await once<T>(path, options);
  } catch (error) {
    const retryable =
      error instanceof ApiError &&
      error.isUnauthenticated &&
      !options.skipRefresh &&
      refreshHandler !== null;

    if (!retryable) throw error;

    refreshPromise ??= refreshHandler!().finally(() => {
      refreshPromise = null;
    });

    const refreshed = await refreshPromise;
    if (!refreshed) throw error;

    return once<T>(path, options);
  }
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'DELETE' }),
  upload: <T>(path: string, formData: FormData) => request<T>(path, { method: 'POST', formData }),
};
