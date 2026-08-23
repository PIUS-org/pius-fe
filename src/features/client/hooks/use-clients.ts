'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ClientManagerRequest, ClientUpdateRequest } from '@/entities/client/types';
import { clientApi, clientKeys, type ClientListParams } from '../api/client.api';

export function useClientList(params: ClientListParams) {
  return useQuery({
    queryKey: clientKeys.list(params),
    queryFn: () => clientApi.list(params),
    placeholderData: (previous) => previous,
  });
}

export function useClientDetail(clientId: number) {
  return useQuery({
    queryKey: clientKeys.detail(clientId),
    queryFn: () => clientApi.detail(clientId),
  });
}

export function useClientProjects(clientId: number, enabled: boolean) {
  return useQuery({
    queryKey: clientKeys.projects(clientId),
    queryFn: () => clientApi.projects(clientId),
    enabled,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: clientApi.create,
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: clientKeys.all }),
  });
}

export function useUpdateClient(clientId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ClientUpdateRequest) => clientApi.update(clientId, body),
    onSuccess: (updated) => {
      queryClient.setQueryData(clientKeys.detail(clientId), updated);
      void queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
}

export function useClientManagers(clientId: number) {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: clientKeys.all });

  const add = useMutation({
    mutationFn: (body: ClientManagerRequest) => clientApi.addManager(clientId, body),
    onSuccess: refresh,
  });

  const remove = useMutation({
    mutationFn: (managerId: number) => clientApi.removeManager(clientId, managerId),
    onSuccess: refresh,
  });

  return { add, remove };
}
