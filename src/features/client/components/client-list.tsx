'use client';

import { useRouter } from 'next/navigation';
import { clientStatusTone } from '@/entities/client/status';
import type { ClientListItem } from '@/entities/client/types';
import { formatMoney } from '@/shared/lib/format';
import { useListParams } from '@/shared/lib/use-list-params';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { Input } from '@/shared/ui/input';
import { PageHeader } from '@/shared/ui/page-header';
import { Pagination } from '@/shared/ui/pagination';
import { Table, type Column } from '@/shared/ui/table';
import { Tag } from '@/shared/ui/tag';
import { useClientList } from '../hooks/use-clients';

const COLUMNS: Column<ClientListItem>[] = [
  {
    key: 'name',
    header: '거래처명',
    nowrap: true,
    cell: (r) => <span className="font-medium">{r.name}</span>,
  },
  {
    key: 'bizRegNo',
    header: '사업자등록번호',
    nowrap: true,
    tabular: true,
    cell: (r) => r.bizRegNo,
  },
  { key: 'ceo', header: '대표명', nowrap: true, cell: (r) => r.ceoName },
  { key: 'manager', header: '담당자', nowrap: true, cell: (r) => r.primaryManagerName ?? '-' },
  { key: 'count', header: '프로젝트', align: 'right', cell: (r) => r.projectCount },
  {
    key: 'status',
    header: '진행여부',
    width: 104,
    cell: (r) => <Tag tone={clientStatusTone(r.status)}>{r.statusLabel}</Tag>,
  },
  {
    key: 'amount',
    header: '누적 계약액',
    align: 'right',
    tabular: true,
    cell: (r) => formatMoney(r.totalContractAmount),
  },
];

export function ClientList() {
  const router = useRouter();
  const { params, update } = useListParams<'ALL'>('ALL');
  const { data, isPending, isError, error } = useClientList({ q: params.q, page: params.page });

  return (
    <>
      <PageHeader
        kicker="거래처관리"
        title="거래처 목록"
        actions={
          <Button variant="primary" onClick={() => router.push('/clients/new')}>
            거래처 등록
          </Button>
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
            aria-label="거래처명 · 대표명 · 담당자명 · 담당자 연락처로 검색"
            placeholder="거래처명 · 대표명 · 담당자명 · 담당자 연락처"
            className="max-w-[340px]"
          />
          <button type="submit" className="sr-only">
            검색
          </button>
        </form>

        <div className="text-muted ml-auto text-[12.5px]">
          {data && `총 ${data.totalElements}곳`}
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
              rowKey={(row) => row.clientId}
              onRowClick={(row) => router.push(`/clients/${row.clientId}`)}
              empty={
                isPending ? (
                  <div className="text-muted py-14 text-center text-[13px]">불러오는 중…</div>
                ) : (
                  <EmptyState
                    title="검색 결과가 없습니다"
                    description="거래처명 · 대표명 · 담당자명 · 연락처로 검색해보세요."
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
              note="한 화면 12곳"
            />
          )}
        </>
      )}
    </>
  );
}
