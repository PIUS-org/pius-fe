import type {
  ClientCreateRequest,
  ClientDetail,
  ClientListItem,
  ClientManager,
  ClientManagerRequest,
  ClientProjectItem,
  ClientUpdateRequest,
} from '@/entities/client/types';
import { api } from '@/shared/api/client';
import type { PageResponse } from '@/shared/api/types';

export type ClientListParams = { q?: string; page?: number; size?: number };

export const clientApi = {
  list: (params: ClientListParams) =>
    api.get<PageResponse<ClientListItem>>('/clients', { query: { ...params } }),

  detail: (clientId: number) => api.get<ClientDetail>(`/clients/${clientId}`),

  projects: (clientId: number) => api.get<ClientProjectItem[]>(`/clients/${clientId}/projects`),

  create: (body: ClientCreateRequest) => api.post<{ clientId: number }>('/clients', body),

  update: (clientId: number, body: ClientUpdateRequest) =>
    api.patch<ClientDetail>(`/clients/${clientId}`, body),

  addManager: (clientId: number, body: ClientManagerRequest) =>
    api.post<ClientManager>(`/clients/${clientId}/managers`, body),

  removeManager: (clientId: number, managerId: number) =>
    api.delete<void>(`/clients/${clientId}/managers/${managerId}`),
};

export const clientKeys = {
  all: ['clients'] as const,
  list: (params: ClientListParams) => [...clientKeys.all, 'list', params] as const,
  detail: (clientId: number) => [...clientKeys.all, 'detail', clientId] as const,
  projects: (clientId: number) => [...clientKeys.all, 'projects', clientId] as const,
};
