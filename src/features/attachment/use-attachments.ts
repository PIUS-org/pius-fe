'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Attachment } from '@/entities/person/types';
import { isApiError } from '@/shared/api/error';
import { useToast } from '@/shared/ui/toast';
import { attachmentApi, openAttachment, type AttachmentOwnerType } from './api';

/**
 * 첨부 업로드 · 삭제 · 열기.
 *
 * 목록은 상세 응답에 함께 담겨 오므로 따로 조회하지 않는다.
 * 변경 후에는 `invalidateKey` 로 상세를 다시 부른다.
 */
export function useAttachments(
  ownerType: AttachmentOwnerType,
  ownerId: number,
  invalidateKey: readonly unknown[],
) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const refresh = () => queryClient.invalidateQueries({ queryKey: invalidateKey });

  const notifyFailure = (error: unknown, fallback: string) => {
    showToast(isApiError(error) ? error.message : fallback);
  };

  const upload = useMutation({
    mutationFn: (file: File) => attachmentApi.upload(ownerType, ownerId, file),
    onSuccess: async () => {
      await refresh();
      showToast('파일을 업로드했습니다.');
    },
    onError: (error) => notifyFailure(error, '업로드에 실패했습니다.'),
  });

  const remove = useMutation({
    mutationFn: (attachment: Attachment) => attachmentApi.remove(attachment.attachmentId),
    onSuccess: async () => {
      await refresh();
      showToast('파일을 삭제했습니다.');
    },
    onError: (error) => notifyFailure(error, '삭제에 실패했습니다.'),
  });

  return {
    onSelect: (file: File) => upload.mutate(file),
    onDelete: (attachment: Attachment) => remove.mutate(attachment),
    onOpen: (attachment: Attachment) => {
      void openAttachment(attachment).catch((error) =>
        notifyFailure(error, '파일을 열 수 없습니다.'),
      );
    },
    busy: upload.isPending || remove.isPending,
  };
}
