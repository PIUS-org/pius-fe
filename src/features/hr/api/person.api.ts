import type {
  PersonCreateRequest,
  PersonDetail,
  PersonListItem,
  PersonUpdateRequest,
} from '@/entities/person/types';
import type { PersonProjectItem } from '@/entities/project/types';
import { api } from '@/shared/api/client';
import type { PageResponse } from '@/shared/api/types';

export type PersonListParams = {
  q?: string;
  status?: 'ALL' | 'ACTIVE' | 'RESIGNED';
  page?: number;
  size?: number;
};

export const personApi = {
  list: (params: PersonListParams) =>
    api.get<PageResponse<PersonListItem>>('/persons', { query: { ...params } }),

  detail: (personId: number) => api.get<PersonDetail>(`/persons/${personId}`),

  projects: (personId: number) => api.get<PersonProjectItem[]>(`/persons/${personId}/projects`),

  create: (body: PersonCreateRequest) =>
    api.post<{ personId: number; accountId: number; loginId: string }>('/persons', body),

  update: (personId: number, body: PersonUpdateRequest) =>
    api.patch<PersonDetail>(`/persons/${personId}`, body),
};

/**
 * queryKey 를 한 곳에 모은다.
 *
 * 배열 리터럴을 화면마다 흩뿌리면 무효화할 때 하나를 빠뜨린다.
 */
export const personKeys = {
  all: ['persons'] as const,
  list: (params: PersonListParams) => [...personKeys.all, 'list', params] as const,
  detail: (personId: number) => [...personKeys.all, 'detail', personId] as const,
  projects: (personId: number) => [...personKeys.all, 'projects', personId] as const,
};
