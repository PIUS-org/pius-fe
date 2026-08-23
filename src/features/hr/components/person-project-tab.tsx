'use client';

import { useRouter } from 'next/navigation';
import { projectStatusTone } from '@/entities/project/status';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { Tag } from '@/shared/ui/tag';
import { usePersonProjects } from '../hooks/use-persons';

/** 인사 상세의 "프로젝트" 탭. 참여했던 프로젝트를 카드로 보여준다. */
export function PersonProjectTab({ personId, active }: { personId: number; active: boolean }) {
  const router = useRouter();
  const { data, isPending } = usePersonProjects(personId, active);

  if (isPending) {
    return <p className="text-muted py-10 text-center text-[13px]">불러오는 중…</p>;
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title="참여한 프로젝트가 없습니다"
        description="프로젝트 상세에서 참여인력으로 추가하면 여기에 표시됩니다."
      />
    );
  }

  return (
    <div className="grid max-w-[1080px] grid-cols-3 gap-3.5">
      {data.map((project) => (
        <Card
          key={project.projectId}
          role="button"
          tabIndex={0}
          onClick={() => router.push(`/projects/${project.projectId}`)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              router.push(`/projects/${project.projectId}`);
            }
          }}
          className="hover:border-accent-400 cursor-pointer p-4.5 transition-colors"
        >
          <div className="flex items-start justify-between gap-2.5">
            <div className="font-heading text-lg leading-tight">{project.name}</div>
            <Tag tone={projectStatusTone(project.status)}>{project.statusLabel}</Tag>
          </div>
          <div className="text-muted mt-3 text-[12.5px] leading-[1.8]">
            <div>시작일 {project.contractStartDate}</div>
            <div>거래처 {project.clientName}</div>
            <div>담당 {project.ownerName ?? '-'}</div>
            <div>역할 {project.role}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}
