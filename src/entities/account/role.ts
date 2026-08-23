import type { Role } from './types';

/**
 * 권한 판정은 여기 한 곳에만 둔다.
 *
 * 화면에서 `role === 'CONTRACTOR'` 를 직접 비교하면 규칙이 흩어져,
 * 나중에 직급 개념이 들어올 때 빠뜨리는 곳이 생긴다.
 *
 * 이 판정은 **화면 편의를 위한 것**이다. 실제 차단은 서버가 하며,
 * 프론트엔드는 403 응답을 항상 처리해야 한다.
 */

/** 인사관리 · 거래처관리 접근 가능 여부. */
export const canManageInternalData = (role: Role) => role !== 'CONTRACTOR';

/** 프로젝트 개설 · 종료 · 참여인력 관리, 계약금액·타인 용역비 조회 가능 여부. */
export const canManageProject = (role: Role) => role !== 'CONTRACTOR';

export const isContractor = (role: Role) => role === 'CONTRACTOR';

/** 로그인 직후 이동할 곳. 용역은 인사관리를 볼 수 없다. */
export const homePathOf = (role: Role) => (isContractor(role) ? '/projects' : '/hr');
