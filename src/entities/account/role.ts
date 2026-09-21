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

/**
 * 주민등록번호 원본 조회 가능 여부.
 *
 * 인사 접근 권한보다 한 단계 좁다 — 고유식별정보라 정직원도 마스킹된 값만 본다.
 * 서버가 같은 기준으로 403 을 준다.
 */
export const canReadRrn = (role: Role) => role === 'MASTER';

/** 로그인 직후 이동할 곳. 용역은 인사관리를 볼 수 없다. */
export const homePathOf = (role: Role) => (isContractor(role) ? '/projects' : '/hr');
