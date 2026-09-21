import type {
  ProjectCreateRequest,
  ProjectDetail,
  ProjectListItem,
  ProjectMember,
  ProjectMemberRequest,
  ProjectReceipt,
  ProjectReceiptRequest,
  ProjectStatus,
  ProjectUpdateRequest,
} from '@/entities/project/types';
import { api } from '@/shared/api/client';
import type { PageResponse } from '@/shared/api/types';

export type ProjectListParams = {
  q?: string;
  status?: ProjectStatus | 'ALL';
  page?: number;
};

export const projectApi = {
  receipts: (projectId: number) => api.get<ProjectReceipt[]>(`/projects/${projectId}/receipts`),

  addReceipt: (projectId: number, body: ProjectReceiptRequest) =>
    api.post<ProjectReceipt>(`/projects/${projectId}/receipts`, body),

  updateReceipt: (projectId: number, receiptId: number, body: ProjectReceiptRequest) =>
    api.patch<ProjectReceipt>(`/projects/${projectId}/receipts/${receiptId}`, body),

  removeReceipt: (projectId: number, receiptId: number) =>
    api.delete<void>(`/projects/${projectId}/receipts/${receiptId}`),

  list: (params: ProjectListParams) =>
    api.get<PageResponse<ProjectListItem>>('/projects', { query: { ...params } }),

  detail: (projectId: number) => api.get<ProjectDetail>(`/projects/${projectId}`),

  create: (body: ProjectCreateRequest) => api.post<{ projectId: number }>('/projects', body),

  update: (projectId: number, body: ProjectUpdateRequest) =>
    api.patch<ProjectDetail>(`/projects/${projectId}`, body),

  close: (projectId: number, actualEndDate: string) =>
    api.post<ProjectDetail>(`/projects/${projectId}/close`, { actualEndDate }),

  addMember: (projectId: number, body: ProjectMemberRequest) =>
    api.post<ProjectMember>(`/projects/${projectId}/members`, body),

  updateMember: (
    projectId: number,
    memberId: number,
    body: { role?: string; outsourcingFee?: number | null; leftAt?: string },
  ) => api.patch<ProjectMember>(`/projects/${projectId}/members/${memberId}`, body),

  removeMember: (projectId: number, memberId: number) =>
    api.delete<void>(`/projects/${projectId}/members/${memberId}`),
};

export const projectKeys = {
  all: ['projects'] as const,
  list: (params: ProjectListParams) => [...projectKeys.all, 'list', params] as const,
  detail: (projectId: number) => [...projectKeys.all, 'detail', projectId] as const,
  receipts: (projectId: number) => [...projectKeys.all, 'receipts', projectId] as const,
};
