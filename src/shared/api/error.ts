import type { ApiErrorBody } from './types';

/**
 * 서버가 내려준 실패 응답을 예외로 감싼 것.
 *
 * 화면은 `status` 로 분기하지 않고 `code` 로 분기한다 —
 * 같은 401 이라도 비밀번호 오류와 비활성 계정은 다르게 안내해야 한다.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: Record<string, string>;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = 'ApiError';
    this.status = status;
    this.code = body.code;
    this.fields = body.fields;
  }

  /** 인증이 풀린 경우. 토큰 재발급을 시도할 대상이다. */
  get isUnauthenticated() {
    return this.status === 401;
  }

  /** 권한 부족. 재발급해도 해결되지 않으므로 안내만 한다. */
  get isForbidden() {
    return this.status === 403;
  }

  fieldError(name: string): string | undefined {
    return this.fields?.[name];
  }
}

/** 서버에 닿지 못했거나 응답이 봉투 형식이 아닌 경우. */
export function networkError(cause?: unknown): ApiError {
  return new ApiError(0, {
    code: 'NETWORK_ERROR',
    message: '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.',
    ...(cause ? {} : {}),
  });
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
