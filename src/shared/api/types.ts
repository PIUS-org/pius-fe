/** 백엔드 공통 응답 봉투. `docs/API.md` 의 계약을 그대로 옮긴 것이다. */

export type ApiErrorBody = {
  code: string;
  message: string;
  /** 입력값 검증 실패일 때만 온다. 필드명 → 메시지. */
  fields?: Record<string, string>;
};

export type ApiSuccess<T> = { success: true; data: T };
export type ApiFailure = { success: false; error: ApiErrorBody };
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

/** 목록 응답. `page` 는 1부터 시작한다. */
export type PageResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type PageParams = {
  page?: number;
  size?: number;
};
