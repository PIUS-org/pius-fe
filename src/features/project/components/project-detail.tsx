'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { canManageProject } from '@/entities/account/role';
import { displayAmount, projectStatusTone } from '@/entities/project/status';
import { useAttachments } from '@/features/attachment/use-attachments';
import { useAccount } from '@/features/auth/auth-provider';
import { isApiError } from '@/shared/api/error';
import { Button } from '@/shared/ui/button';
import { Card, CardKicker } from '@/shared/ui/card';
import { Dialog } from '@/shared/ui/dialog';
import { EmptyState } from '@/shared/ui/empty-state';
import { Field } from '@/shared/ui/field';
import { FileUpload } from '@/shared/ui/file-upload';
import { Input } from '@/shared/ui/input';
import { TabPanel, Tabs } from '@/shared/ui/tabs';
import { Tag } from '@/shared/ui/tag';
import { useToast } from '@/shared/ui/toast';
import { projectKeys } from '../api/project.api';
import { useCloseProject, useProjectDetail } from '../hooks/use-projects';
import { ProjectBasicTab } from './project-basic-tab';
import { ProjectMemberTab } from './project-member-tab';

const TABS = [
  { value: 'basic', label: '기본정보' },
  { value: 'members', label: '참여인력' },
  { value: 'docs', label: '계약서' },
] as const;

export function ProjectDetail({ projectId }: { projectId: number }) {
  const router = useRouter();
  const account = useAccount();
  const { showToast } = useToast();
  const [tab, setTab] = useState<string>('basic');
  const [closeOpen, setCloseOpen] = useState(false);
  const [closeError, setCloseError] = useState<string | null>(null);

  const { data: project, isPending, isError, error } = useProjectDetail(projectId);
  const close = useCloseProject(projectId);
  const attachments = useAttachments('PROJECT_CONTRACT', projectId, projectKeys.detail(projectId));

  const canManage = canManageProject(account.role);

  if (isPending) {
    return <p className="text-muted py-16 text-center text-[13px]">불러오는 중…</p>;
  }

  if (isError || !project) {
    const forbidden = isApiError(error) && error.isForbidden;
    return (
      <EmptyState
        title={forbidden ? '접근 권한이 없습니다' : '프로젝트를 불러오지 못했습니다'}
        description={
          forbidden
            ? '용역 계정은 본인이 참여한 프로젝트만 확인할 수 있습니다.'
            : error instanceof Error
              ? error.message
              : undefined
        }
        action={
          <Button variant="secondary" onClick={() => router.push('/projects')}>
            프로젝트 목록으로
          </Button>
        }
      />
    );
  }

  async function handleClose(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get('actualEndDate') ?? '');
    setCloseError(null);
    try {
      await close.mutateAsync(value);
      setCloseOpen(false);
      showToast('프로젝트를 종료 처리했습니다.');
    } catch (err) {
      setCloseError(isApiError(err) ? err.message : '종료 처리에 실패했습니다.');
    }
  }

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        className="mb-3.5"
        onClick={() => router.push('/projects')}
      >
        ← 프로젝트 목록
      </Button>

      <Card className="mb-4.5 px-6 py-5">
        <div className="flex items-start justify-between gap-5">
          <div>
            <h2 className="font-heading text-[30px] leading-tight">{project.name}</h2>
            <div className="mt-2 flex items-center gap-2.5">
              <Tag tone={projectStatusTone(project.status)}>{project.statusLabel}</Tag>
              <span className="text-muted-strong text-[13px]">
                {project.client.name} · 담당 {project.owner?.name ?? '-'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-5.5">
            <div className="text-right">
              <div className="text-muted-weak text-[11px] tracking-[0.1em] uppercase">계약금액</div>
              <div className="font-heading tabular text-[26px]">
                {displayAmount(project.contractAmount, project.contractAmountMasked)}
              </div>
            </div>
            {canManage && !project.actualEndDate && (
              <Button variant="secondary" onClick={() => setCloseOpen(true)}>
                프로젝트 종료
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Tabs items={TABS} value={tab} onChange={setTab}>
        <TabPanel value="basic">
          <ProjectBasicTab
            key={`${project.projectId}-${project.actualEndDate}`}
            project={project}
          />
        </TabPanel>
        <TabPanel value="members">
          <ProjectMemberTab project={project} />
        </TabPanel>
        <TabPanel value="docs">
          <Card className="max-w-[620px] p-5.5">
            <CardKicker className="mb-3">계약서</CardKicker>
            <FileUpload
              files={project.attachments}
              onSelect={canManage ? attachments.onSelect : undefined}
              onOpen={attachments.onOpen}
              onDelete={canManage ? attachments.onDelete : undefined}
              readOnly={!canManage}
            />
          </Card>
        </TabPanel>
      </Tabs>

      <Dialog
        open={closeOpen}
        onOpenChange={setCloseOpen}
        title="프로젝트 종료"
        description="실제 종료일을 입력하면 진행상태가 '완료'로 변경됩니다. 계약 종료일은 그대로 유지됩니다."
      >
        <form onSubmit={handleClose}>
          <Field label="실제 종료일" required>
            {({ id }) => (
              <>
                <Input
                  id={id}
                  name="actualEndDate"
                  type="date"
                  required
                  min={project.contractStartDate}
                />
                <p className="text-muted mt-1.5 text-[11.5px]">
                  계약 시작일({project.contractStartDate}) 이전은 선택할 수 없습니다.
                </p>
              </>
            )}
          </Field>

          {closeError && (
            <p role="alert" className="text-danger mt-3 text-[12.5px]">
              {closeError}
            </p>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setCloseOpen(false)}>
              취소
            </Button>
            <Button type="submit" variant="primary" disabled={close.isPending}>
              종료 처리
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
