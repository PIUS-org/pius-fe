import type { TagTone } from '@/shared/ui/tag';
import type { EmploymentStatus, EmploymentType } from './types';

/**
 * 재직상태 → 태그 색.
 *
 * 라벨은 서버가 `employmentStatusLabel` 로 내려주므로 여기서 만들지 않는다.
 * 두 곳에서 라벨을 만들면 표기가 어긋난다.
 */
export function employmentStatusTone(status: EmploymentStatus): TagTone {
  return status === 'ACTIVE' ? 'accent' : 'neutral';
}

export const isContractorType = (type: EmploymentType) => type === 'CONTRACTOR';

/**
 * 근태 정보에서 날짜 라벨이 고용형태에 따라 달라진다.
 * 정직원은 입사일/퇴사일, 용역은 계약시작일/계약종료일이다.
 */
export function hiredAtLabel(type: EmploymentType) {
  return isContractorType(type) ? '계약시작일' : '입사일';
}

export function leaveAtLabel(type: EmploymentType) {
  return isContractorType(type) ? '계약종료일' : '퇴사일';
}
