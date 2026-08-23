import type { Attachment, EmploymentStatus, EmploymentType } from '@/entities/person/types';

export type ProjectStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';

/**
 * 금액 필드의 규약.
 *
 * `contractAmount: null` 은 두 가지를 뜻할 수 있어 `*Masked` 를 함께 본다.
 * - `masked: true` — 값은 있으나 볼 권한이 없다 → "비공개"
 * - `masked: false` — 값 자체가 없다 → "-"
 */
export type ProjectListItem = {
  projectId: number;
  name: string;
  clientId: number;
  clientName: string;
  contractStartDate: string;
  contractEndDate: string;
  actualEndDate: string | null;
  contractAmount: number | null;
  contractAmountMasked: boolean;
  status: ProjectStatus;
  statusLabel: string;
  /** 계약기간이 지났는데 진행중. 화면에서 계약기간을 빨간 글씨로 표시한다. */
  overdue: boolean;
  ownerName: string | null;
};

export type ProjectMember = {
  memberId: number;
  personId: number;
  name: string;
  employmentType: EmploymentType;
  employmentTypeLabel: string;
  role: string;
  outsourcingFee: number | null;
  outsourcingFeeMasked: boolean;
  employmentStatus: EmploymentStatus;
  employmentStatusLabel: string;
  joinedAt: string;
  leftAt: string | null;
};

export type ProjectDetail = {
  projectId: number;
  name: string;
  client: { clientId: number; name: string };
  contractStartDate: string;
  contractEndDate: string;
  actualEndDate: string | null;
  contractAmount: number | null;
  contractAmountMasked: boolean;
  receivedAmount: number | null;
  receivedAmountMasked: boolean;
  status: ProjectStatus;
  statusLabel: string;
  overdue: boolean;
  owner: { personId: number; name: string } | null;
  description: string | null;
  members: ProjectMember[];
  attachments: Attachment[];
};

/** 인사 상세의 "프로젝트" 탭 카드. */
export type PersonProjectItem = {
  projectId: number;
  name: string;
  clientName: string;
  contractStartDate: string;
  status: ProjectStatus;
  statusLabel: string;
  overdue: boolean;
  ownerName: string | null;
  role: string;
};

export type ProjectCreateRequest = {
  name: string;
  clientId: number;
  contractStartDate: string;
  contractEndDate: string;
  contractAmount?: number | null;
  ownerId?: number | null;
};

export type ProjectUpdateRequest = {
  name?: string;
  contractAmount?: number | null;
  receivedAmount?: number | null;
  description?: string;
  actualEndDate?: string;
  reopen?: boolean;
  ownerId?: number | null;
  clearOwner?: boolean;
};

export type ProjectMemberRequest = {
  personId: number;
  role: string;
  outsourcingFee?: number | null;
  joinedAt?: string;
};
