import { formatMoney } from '@/shared/lib/format';
import type { TagTone } from '@/shared/ui/tag';
import type { ProjectStatus } from './types';

/** 진행상태 → 태그 색. 예정만 outline 이다. */
export function projectStatusTone(status: ProjectStatus): TagTone {
  switch (status) {
    case 'IN_PROGRESS':
      return 'accent';
    case 'PLANNED':
      return 'outline';
    case 'COMPLETED':
      return 'neutral';
  }
}

/** 목록 필터에 쓰는 값. `ALL` 은 필터 없음이다. */
export const PROJECT_STATUS_FILTERS = [
  { value: 'ALL', label: '전체' },
  { value: 'PLANNED', label: '예정' },
  { value: 'IN_PROGRESS', label: '진행중' },
  { value: 'COMPLETED', label: '완료' },
] as const;

export type ProjectStatusFilter = (typeof PROJECT_STATUS_FILTERS)[number]['value'];

/**
 * 금액 표시 문자열.
 *
 * 서버가 `null` + `masked` 로 내려준 것을 화면 문구로 바꾼다.
 * 가려진 값과 없는 값을 같은 `-` 로 보여주면 사용자가 "금액이 없는 프로젝트"로 오해한다.
 */
export function displayAmount(amount: number | null, masked: boolean): string {
  if (masked) return '비공개';
  if (amount === null) return '-';
  return formatMoney(amount);
}

/**
 * 용역비 표시 문자열.
 *
 * 정직원은 금액 자체가 없어 `—` 로 흐리게 표시한다. 가려진 것이 아니다.
 */
export function displayFee(
  fee: number | null,
  masked: boolean,
  employmentType: 'EMPLOYEE' | 'CONTRACTOR',
): string {
  if (employmentType === 'EMPLOYEE') return '—';
  if (masked) return '비공개';
  if (fee === null) return '-';
  return formatMoney(fee);
}
