'use client';

import { useRouter } from 'next/navigation';
import { employmentStatusTone } from '@/entities/person/status';
import type { PersonListItem } from '@/entities/person/types';
import { formatDate } from '@/shared/lib/format';
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
import { usePersonList } from '../hooks/use-persons';

const STATUS_FILTERS = [
  { value: 'ALL', label: '전체' },
  { value: 'ACTIVE', label: '재직' },
  { value: 'RESIGNED', label: '퇴사' },
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number]['value'];

const PAGE_SIZE = 12;

export function PersonList() {
  const router = useRouter();
  const { params, update } = useListParams<StatusFilter>('ALL');
  const { data, isPending, isError, error } = usePersonList(params);

  const columns: Column<PersonListItem>[] = [
    {
      key: 'no',
      header: 'No',
      width: 46,
      cell: (_row) => null, // 아래에서 인덱스로 채운다
    },
    { key: 'name', header: '이름', cell: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'phone', header: '전화번호', nowrap: true, cell: (r) => r.phone },
    { key: 'type', header: '고용형태', width: 96, cell: (r) => r.employmentTypeLabel },
    { key: 'job', header: '직무', cell: (r) => r.jobTitle ?? '-' },
    {
      key: 'dates',
      header: '입사일 · 퇴사일',
      width: 190,
      nowrap: true,
      tabular: true,
      cell: (r) => (r.leaveAt ? `${r.hiredAt} ~ ${r.leaveAt}` : formatDate(r.hiredAt)),
    },
    {
      key: 'status',
      header: '재직여부',
      width: 100,
      cell: (r) => (
        <Tag tone={employmentStatusTone(r.employmentStatus)}>{r.employmentStatusLabel}</Tag>
      ),
    },
  ];

  // "No" 는 서버가 주지 않는다. 페이지와 순번으로 만든다.
  const startNo = (params.page - 1) * PAGE_SIZE;
  const rows = data?.content ?? [];
  const numbered = columns.map((column) =>
    column.key === 'no'
      ? {
          ...column,
          cell: (row: PersonListItem) => (
            <span className="text-muted-weak">{startNo + rows.indexOf(row) + 1}</span>
          ),
        }
      : column,
  );

  const rangeLabel =
    data && data.totalElements > 0 ? `${startNo + 1}–${startNo + rows.length}번째` : '';

  return (
    <>
      <PageHeader
        kicker="인사관리"
        title="인력 목록"
        actions={
          <Button variant="primary" onClick={() => router.push('/hr/new')}>
            인사 등록
          </Button>
        }
      />

      <div className="mb-3.5 flex items-center gap-2.5">
        {/*
         * 검색어를 상태로 들지 않는다. 타이핑마다 URL 을 바꾸면 뒤로가기 기록이 지저분해지고,
         * URL 을 상태와 동기화하는 effect 도 필요 없어진다.
         * key 를 붙여 뒤로가기로 조건이 바뀌면 인풋도 함께 갱신되게 한다.
         */}
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
            aria-label="이름 또는 전화번호로 검색"
            placeholder="이름 또는 전화번호로 검색"
            className="max-w-[290px]"
          />
          <button type="submit" className="sr-only">
            검색
          </button>
        </form>

        <Segmented
          label="재직여부"
          value={params.status}
          onChange={(status) => update({ status })}
          options={STATUS_FILTERS}
        />

        <div className="text-muted ml-auto text-[12.5px]">
          {data && `검색 결과 ${data.totalElements}명${rangeLabel ? ` · ${rangeLabel}` : ''}`}
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
              columns={numbered}
              rows={rows}
              rowKey={(row) => row.personId}
              onRowClick={(row) => router.push(`/hr/${row.personId}`)}
              empty={
                isPending ? (
                  <div className="text-muted py-14 text-center text-[13px]">불러오는 중…</div>
                ) : (
                  <EmptyState
                    title="검색 결과가 없습니다"
                    description="다른 이름이나 전화번호로 검색해보세요."
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
              note={`한 화면 ${PAGE_SIZE}명`}
            />
          )}
        </>
      )}
    </>
  );
}
