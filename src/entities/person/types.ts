import type { Role, AccountStatus } from '@/entities/account/types';

export type EmploymentType = 'EMPLOYEE' | 'CONTRACTOR';
export type EmploymentStatus = 'ACTIVE' | 'RESIGNED';

export type PersonListItem = {
  personId: number;
  name: string;
  phone: string;
  employmentType: EmploymentType;
  employmentTypeLabel: string;
  jobTitle: string | null;
  employmentStatus: EmploymentStatus;
  employmentStatusLabel: string;
  hiredAt: string;
  leaveAt: string | null;
};

export type PersonDetail = {
  personId: number;
  name: string;
  /** 서버가 마스킹해서 내려준다. 원본이 오는 경로는 없다. */
  rrnMasked: string;
  phone: string;
  email: string | null;
  address: string;
  employmentType: EmploymentType;
  employmentTypeLabel: string;
  employmentStatus: EmploymentStatus;
  employmentStatusLabel: string;
  hiredAt: string;
  leaveAt: string | null;
  jobTitle: string | null;
  account: {
    accountId: number;
    loginId: string;
    role: Role;
    status: AccountStatus;
  };
  projectSummary: { total: number; inProgress: number };
  attachments: Attachment[];
};

export type Attachment = {
  attachmentId: number;
  ownerType: 'PERSON_CONTRACT' | 'CLIENT_BIZ_LICENSE' | 'PROJECT_CONTRACT';
  ownerId: number;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  createdAt: string;
};

export type PersonCreateRequest = {
  name: string;
  rrn: string;
  employmentType: EmploymentType;
  hiredAt: string;
  phone: string;
  address: string;
  email?: string;
  loginId: string;
};

export type PersonUpdateRequest = {
  phone?: string;
  email?: string;
  jobTitle?: string;
  leaveAt?: string;
  clearLeaveAt?: boolean;
  active?: boolean;
};
