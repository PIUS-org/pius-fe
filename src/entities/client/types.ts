import type { Attachment } from '@/entities/person/types';

export type ClientStatus = 'ONGOING' | 'DONE' | 'POTENTIAL';

export type ClientListItem = {
  clientId: number;
  name: string;
  bizRegNo: string;
  ceoName: string;
  primaryManagerName: string | null;
  projectCount: number;
  status: ClientStatus;
  statusLabel: string;
  totalContractAmount: number;
};

export type ClientManager = {
  managerId: number;
  name: string;
  title: string | null;
  phone: string | null;
  email: string | null;
  primary: boolean;
};

export type ClientSummary = {
  status: ClientStatus;
  statusLabel: string;
  projectCount: number;
  totalContractAmount: number;
  totalReceivedAmount: number;
  unpaidAmount: number;
};

export type ClientDetail = {
  clientId: number;
  name: string;
  bizRegNo: string;
  ceoName: string;
  industry: string | null;
  tel: string | null;
  address: string | null;
  email: string | null;
  homepage: string | null;
  description: string | null;
  notes: string | null;
  summary: ClientSummary;
  managers: ClientManager[];
  attachments: Attachment[];
};

/** 거래처 상세 "업무정보" 탭의 프로젝트 행. */
export type ClientProjectItem = {
  projectId: number;
  name: string;
  contractStartDate: string;
  contractEndDate: string;
  memberNames: string[];
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
  statusLabel: string;
  overdue: boolean;
  contractAmount: number | null;
  ownerName: string | null;
};

export type ClientCreateRequest = {
  name: string;
  bizRegNo: string;
  ceoName: string;
  industry?: string;
  tel?: string;
  address?: string;
  email?: string;
  homepage?: string;
  description?: string;
};

export type ClientUpdateRequest = Partial<ClientCreateRequest> & { notes?: string };

export type ClientManagerRequest = {
  name: string;
  title?: string;
  phone?: string;
  email?: string;
  primary?: boolean;
};
