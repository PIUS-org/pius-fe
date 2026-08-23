'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ClientDetail, ClientProjectItem } from '@/entities/client/types';
import { projectStatusTone } from '@/entities/project/status';
import { isApiError } from '@/shared/api/error';
import { formatMoney } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';
import { Card, CardKicker } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { Table, type Column } from '@/shared/ui/table';
import { Tag } from '@/shared/ui/tag';
import { Textarea } from '@/shared/ui/textarea';
import { useToast } from '@/shared/ui/toast';
import { useClientProjects, useUpdateClient } from '../hooks/use-clients';

const COLUMNS: Column<ClientProjectItem>[] = [
  { key: 'name', header: '프로젝트명', cell: (r) => <span className="font-medium">{r.name}</span> },
  {
    key: 'start',
    header: '시작일',
    width: 100,
    nowrap: true,
    tabular: true,
    // 계약기간이 지났는데 진행중이면 빨간 글씨로 알린다.
    cell: (r) => (
      <span className={r.overdue ? 'text-danger' : undefined}>{r.contractStartDate}</span>
    ),
  },
  {
    key: 'end',
    header: '마감일',
    width: 100,
    nowrap: true,
    tabular: true,
    cell: (r) => <span className={r.overdue ? 'text-danger' : undefined}>{r.contractEndDate}</span>,
  },
  {
    key: 'members',
    header: '참여자',
    cell: (r) => <span className="text-[13px]">{r.memberNames.join(', ') || '-'}</span>,
  },
  {
    key: 'status',
    header: '진행여부',
    width: 92,
    cell: (r) => <Tag tone={projectStatusTone(r.status)}>{r.statusLabel}</Tag>,
  },
  {
    key: 'amount',
    header: '계약금액',
    align: 'right',
    tabular: true,
    cell: (r) => formatMoney(r.contractAmount, '-'),
  },
];

export function ClientWorkTab({ client, active }: { client: ClientDetail; active: boolean }) {
  const router = useRouter();
  const { showToast } = useToast();
  const update = useUpdateClient(client.clientId);
  const { data: projects, isPending } = useClientProjects(client.clientId, active);

  const [notes, setNotes] = useState(client.notes ?? '');
  const dirty = notes !== (client.notes ?? '');

  async function saveNotes() {
    try {
      await update.mutateAsync({ notes });
      showToast('메모를 저장했습니다.');
    } catch (error) {
      showToast(isApiError(error) ? error.message : '저장에 실패했습니다.');
    }
  }

  const { summary } = client;

  return (
    <div className="grid [grid-template-columns:minmax(560px,1fr)_340px] items-start gap-5">
      <div className="flex flex-col gap-4.5">
        <Card className="px-5.5 py-5">
          <CardKicker className="mb-2.5">요구사항 및 특이사항</CardKicker>
          <Textarea
            aria-label="요구사항 및 특이사항"
            className="min-h-[110px]"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
          <div className="mt-3">
            <Button variant="primary" disabled={!dirty || update.isPending} onClick={saveNotes}>
              {update.isPending ? '저장 중…' : '메모 저장'}
            </Button>
          </div>
        </Card>

        <Card className="px-4.5 pt-4 pb-1">
          <CardKicker className="mb-1.5">프로젝트</CardKicker>
          <Table
            columns={COLUMNS}
            rows={projects ?? []}
            rowKey={(row) => row.projectId}
            onRowClick={(row) => router.push(`/projects/${row.projectId}`)}
            empty={
              isPending ? (
                <div className="text-muted py-10 text-center text-[13px]">불러오는 중…</div>
              ) : (
                <EmptyState
                  title="등록된 프로젝트가 없습니다"
                  description="프로젝트를 개설하면 여기에 표시됩니다."
                />
              )
            }
          />
        </Card>
      </div>

      <div className="flex flex-col gap-4.5">
        <Card className="px-5.5 py-5">
          <CardKicker className="mb-3">계약 누적액</CardKicker>
          <div className="border-divider flex justify-between border-b pb-2 text-sm">
            <span className="text-muted text-[13px]">계약금</span>
            <span className="tabular">{formatMoney(summary.totalContractAmount)}</span>
          </div>
          <div className="border-divider flex justify-between border-b py-2 text-sm">
            <span className="text-muted text-[13px]">수령</span>
            <span className="tabular">{formatMoney(summary.totalReceivedAmount)}</span>
          </div>
          <div className="flex justify-between pt-2 text-sm">
            <span className="text-muted text-[13px]">미수금</span>
            <span className="tabular text-accent-700">{formatMoney(summary.unpaidAmount)}</span>
          </div>
        </Card>

        <Card className="px-5.5 py-5">
          <CardKicker className="mb-2">계정관리</CardKicker>
          <p className="text-muted text-[12.5px]">
            개발 중 사용한 계정 정보를 저장합니다. 추후 상세 기획 예정.
          </p>
        </Card>
      </div>
    </div>
  );
}
