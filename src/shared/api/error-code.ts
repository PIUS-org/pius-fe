/**
 * 서버 에러코드 → 화면 문구.
 *
 * 서버도 사용자용 메시지를 함께 내려주므로 기본은 그것을 쓴다.
 * 이 표는 **화면 맥락에 맞게 다르게 안내해야 하는 경우**에만 쓴다.
 * 예: 로그인 화면의 401 은 "다시 로그인해주세요" 가 아니라 아이디/비밀번호 안내여야 한다.
 */
export const ERROR_MESSAGES: Record<string, string> = {
  NETWORK_ERROR: '서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인해주세요.',
  FORBIDDEN: '접근 권한이 없습니다.',
  UNAUTHENTICATED: '로그인이 필요합니다.',
};

export function messageOf(code: string, fallback: string): string {
  return ERROR_MESSAGES[code] ?? fallback;
}
