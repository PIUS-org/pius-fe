'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PersonUpdateRequest } from '@/entities/person/types';
import { personApi, personKeys, type PersonListParams } from '../api/person.api';

export function usePersonList(params: PersonListParams) {
  return useQuery({
    queryKey: personKeys.list(params),
    queryFn: () => personApi.list(params),
    // 페이지를 넘길 때 목록이 통째로 사라지지 않게 이전 결과를 유지한다.
    placeholderData: (previous) => previous,
  });
}

export function usePersonDetail(personId: number) {
  return useQuery({
    queryKey: personKeys.detail(personId),
    queryFn: () => personApi.detail(personId),
  });
}

export function usePersonProjects(personId: number, enabled: boolean) {
  return useQuery({
    queryKey: personKeys.projects(personId),
    queryFn: () => personApi.projects(personId),
    // 탭을 열기 전에는 부르지 않는다.
    enabled,
  });
}

export function useUpdatePerson(personId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: PersonUpdateRequest) => personApi.update(personId, body),
    onSuccess: (updated) => {
      queryClient.setQueryData(personKeys.detail(personId), updated);
      // 목록의 직무·재직여부도 함께 바뀐다.
      void queryClient.invalidateQueries({ queryKey: personKeys.all });
    },
  });
}

export function useCreatePerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: personApi.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: personKeys.all });
    },
  });
}
