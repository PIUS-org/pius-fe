'use client';

import { useRouter } from 'next/navigation';
import { canManageProject } from '@/entities/account/role';
import {
  displayAmount,
  PROJECT_STATUS_FILTERS,
  projectStatusTone,
  type ProjectStatusFilter,
} from '@/entities/project/status';
import type { ProjectListItem } from '@/entities/project/types';
import { useAccount } from '@/features/auth/auth-provider';
import { formatDateRange } from '@/shared/lib/format';
import { useListParams } from '@/shared/lib/use-list-params';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { Input } from '@/shared/ui/input';
import { PageHeader } from '@/shared/ui/page-header';
import { Pagination } from '@/shared/ui/pagination';
import { Segmented } from '@/shared/ui/segmented';
import { Table, type Column } from '@/shared/ui/table';
import { Tag } from '@/shared/ui/tag';
import { useProjectList } from '../hooks/use-projects';

const COLUMNS: Column<ProjectListItem>[] = [
  { key: 'name', header: '프로젝트명', cell: (r) => <span className="font-medium">{r.name}</span> },
  { key: 'client', header: '거래처', nowrap: true, cell: (r) => r.clientName },
  {
    key: 'period',
    header: '계약기간',
    nowrap: true,
    tabular: true,
    /* 계약기간이 지났는데 진행중이면 빨간 글씨로 알린다. 기획의 핵심 신호다. */
    cell: (r) => (
      <span className={r.overdue ? 'text-danger' : undefined}>
        {formatDateRange(r.contractStartDate, r.contractEndDate)}
      </span>
    ),
  },
  {
    key: 'actualEnd',
    header: '실제 종료일',
    width: 104,
    nowrap: true,
    tabular: true,
    cell: (r) => r.actualEndDate ?? '-',
  },
  {
    key: 'amount',
    header: '계약금액',
    align: 'right',
    tabular: true,
    cell: (r) => displayAmount(r.contractAmount, r.contractAmountMasked),
  },
  {
    key: 'status',
    header: '진행상태',
    width: 96,
    cell: (r) => <Tag tone={projectStatusTone(r.status)}>{r.statusLabel}</Tag>,
  },
  { key: 'owner', header: '담당자', width: 86, cell: (r) => r.ownerName ?? '-' },
];

const PAGE_SIZE = 12;

export function ProjectList() {
  const router = useRouter();
  const account = useAccount();
  const { params, update } = useListParams<ProjectStatusFilter>('ALL');
  const { data, isPending, isError, error } = useProjectList(params);

  const canCreate = canManageProject(account.role);
  const startNo = (params.page - 1) * PAGE_SIZE;
  const rangeLabel =
    data && data.totalElements > 0 ? `${startNo + 1}–${startNo + data.content.length}번째` : '';

  return (
    <>
      <PageHeader
        kicker="프로젝트관리"
        title="프로젝트 목록"
        description={canCreate ? undefined : '본인이 참여한 프로젝트만 표시됩니다.'}
        actions={
          canCreate ? (
            <Button variant="primary" onClick={() => router.push('/projects/new')}>
              프로젝트 개설
            </Button>
          ) : undefined
        }
      />

      <div className="mb-3.5 flex items-center gap-2.5">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const value = new FormData(event.currentTarget).get('q');
            update({ q: typeof value === 'string' ? value.trim() : '' });
          }}
          className="contents"
        >
          <Input
            key={params.q}
            name="q"
            defaultValue={params.q}
            aria-label="프로젝트명 또는 거래처명으로 검색"
            placeholder="프로젝트명 또는 거래처명으로 검색"
            className="max-w-[310px]"
          />
          <button type="submit" className="sr-only">
            검색
          </button>
        </form>

        <Segmented
          label="진행상태"
          value={params.status}
          onChange={(status) => update({ status })}
          options={PROJECT_STATUS_FILTERS}
        />

        <div className="text-muted ml-auto text-[12.5px]">
          {data && `검색 결과 ${data.totalElements}건${rangeLabel ? ` · ${rangeLabel}` : ''}`}
        </div>
      </div>

      {isError ? (
        <EmptyState
          title="목록을 불러오지 못했습니다"
          description={error instanceof Error ? error.message : undefined}
        />
      ) : (
        <>
          <Card className="px-4 pt-1.5 pb-0.5">
            <Table
              columns={COLUMNS}
              rows={data?.content ?? []}
              rowKey={(row) => row.projectId}
              onRowClick={(row) => router.push(`/projects/${row.projectId}`)}
              empty={
                isPending ? (
                  <div className="text-muted py-14 text-center text-[13px]">불러오는 중…</div>
                ) : (
                  <EmptyState
                    title="프로젝트가 없습니다"
                    description={
                      canCreate
                        ? '프로젝트를 개설하면 여기에 표시됩니다.'
                        : '참여 중인 프로젝트가 없습니다.'
                    }
                  />
                )
              }
            />
          </Card>

          {data && (
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              onChange={(page) => update({ page })}
              note={`한 화면 ${PAGE_SIZE}개`}
            />
          )}
        </>
      )}
    </>
  );
}
