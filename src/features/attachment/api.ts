import type { Attachment } from '@/entities/person/types';
import { api, getAccessToken } from '@/shared/api/client';
import { env } from '@/shared/config/env';

export type AttachmentOwnerType = Attachment['ownerType'];

export const attachmentApi = {
  list: (ownerType: AttachmentOwnerType, ownerId: number) =>
    api.get<Attachment[]>('/attachments', { query: { ownerType, ownerId } }),

  upload: (ownerType: AttachmentOwnerType, ownerId: number, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.upload<Attachment>(`/attachments?ownerType=${ownerType}&ownerId=${ownerId}`, form);
  },

  remove: (attachmentId: number) => api.delete<void>(`/attachments/${attachmentId}`),
};

/**
 * 첨부를 새 탭으로 연다.
 *
 * 다운로드에도 Bearer 토큰이 필요해 `<a href>` 로 바로 열 수 없다.
 * 받아서 blob URL 로 띄운 뒤 해제한다.
 */
export async function openAttachment(attachment: Attachment): Promise<void> {
  const response = await fetch(`${env.apiBaseUrl}/attachments/${attachment.attachmentId}`, {
    headers: { Authorization: `Bearer ${getAccessToken() ?? ''}` },
  });
  if (!response.ok) {
    throw new Error('파일을 열 수 없습니다.');
  }
  const url = URL.createObjectURL(await response.blob());
  window.open(url, '_blank', 'noopener');
  // 새 탭이 읽어간 뒤 해제한다. 즉시 해제하면 빈 탭이 뜬다.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
