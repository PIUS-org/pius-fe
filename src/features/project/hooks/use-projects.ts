'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProjectMemberRequest, ProjectUpdateRequest } from '@/entities/project/types';
import { clientApi, clientKeys } from '@/features/client/api/client.api';
import { personApi, personKeys } from '@/features/hr/api/person.api';
import { projectApi, projectKeys, type ProjectListParams } from '../api/project.api';

export function useProjectList(params: ProjectListParams) {
  return useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => projectApi.list(params),
    placeholderData: (previous) => previous,
  });
}

export function useProjectDetail(projectId: number) {
  return useQuery({
    queryKey: projectKeys.detail(projectId),
    queryFn: () => projectApi.detail(projectId),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectApi.create,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
      // 거래처의 프로젝트 수·누적 계약액이 함께 바뀐다.
      void queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
}

/** 프로젝트가 바뀌면 거래처 집계와 인사 상세의 참여 프로젝트도 달라진다. */
function invalidateRelated(queryClient: ReturnType<typeof useQueryClient>, projectId: number) {
  void queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
  void queryClient.invalidateQueries({ queryKey: projectKeys.list({}) });
  void queryClient.invalidateQueries({ queryKey: clientKeys.all });
  void queryClient.invalidateQueries({ queryKey: personKeys.all });
}

export function useUpdateProject(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ProjectUpdateRequest) => projectApi.update(projectId, body),
    onSuccess: (updated) => {
      queryClient.setQueryData(projectKeys.detail(projectId), updated);
      invalidateRelated(queryClient, projectId);
    },
  });
}

export function useCloseProject(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (actualEndDate: string) => projectApi.close(projectId, actualEndDate),
    onSuccess: (updated) => {
      queryClient.setQueryData(projectKeys.detail(projectId), updated);
      invalidateRelated(queryClient, projectId);
    },
  });
}

export function useProjectMembers(projectId: number) {
  const queryClient = useQueryClient();
  const refresh = () => invalidateRelated(queryClient, projectId);

  return {
    add: useMutation({
      mutationFn: (body: ProjectMemberRequest) => projectApi.addMember(projectId, body),
      onSuccess: refresh,
    }),
    update: useMutation({
      mutationFn: ({
        memberId,
        ...body
      }: {
        memberId: number;
        outsourcingFee?: number | null;
        role?: string;
      }) => projectApi.updateMember(projectId, memberId, body),
      onSuccess: refresh,
    }),
    remove: useMutation({
      mutationFn: (memberId: number) => projectApi.removeMember(projectId, memberId),
      onSuccess: refresh,
    }),
  };
}

/**
 * 선택 목록용 조회.
 *
 * 서버가 페이지 크기를 100 으로 제한하므로 그 이상은 담기지 않는다.
 * 인력·거래처가 100 을 넘으면 검색형 셀렉트로 바꿔야 한다.
 */
const SELECT_PAGE_SIZE = 100;

export function useClientOptions(enabled = true) {
  return useQuery({
    queryKey: [...clientKeys.all, 'options'],
    queryFn: () => clientApi.list({ page: 1, size: SELECT_PAGE_SIZE }),
    enabled,
    staleTime: 60_000,
  });
}

/** 참여인력 후보. 퇴사자도 포함한다 — 과거 참여를 기록할 수 있어야 한다. */
export function usePersonOptions(enabled = true) {
  return useQuery({
    queryKey: [...personKeys.all, 'options'],
    queryFn: () => personApi.list({ page: 1, size: SELECT_PAGE_SIZE }),
    enabled,
    staleTime: 60_000,
  });
}
