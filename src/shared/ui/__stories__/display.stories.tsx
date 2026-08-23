import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { Button } from '../button';
import { Card, CardKicker, Panel } from '../card';
import { DetailRow } from '../detail-row';
import { EmptyState } from '../empty-state';
import { PageHeader } from '../page-header';
import { Pagination } from '../pagination';
import { Table, type Column } from '../table';
import { TabPanel, Tabs } from '../tabs';
import { Tag } from '../tag';

const meta = {
  title: 'Components/표시',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const 태그: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Tag tone="accent">재직</Tag>
        <Tag tone="accent">진행중</Tag>
        <Tag tone="accent">진행</Tag>
        <span className="text-muted text-xs">accent — 살아있는 상태</span>
      </div>
      <div className="flex items-center gap-2">
        <Tag tone="neutral">퇴사</Tag>
        <Tag tone="neutral">완료</Tag>
        <Tag tone="neutral">진행완료</Tag>
        <span className="text-muted text-xs">neutral — 끝난 상태</span>
      </div>
      <div className="flex items-center gap-2">
        <Tag tone="outline">예정</Tag>
        <Tag tone="outline">잠재</Tag>
        <span className="text-muted text-xs">outline — 아직 시작 전</span>
      </div>
      <div className="flex items-center gap-2">
        <Tag tone="accent-2">보조</Tag>
        <span className="text-muted text-xs">accent-2 — v1.0 미사용, 확장용</span>
      </div>
    </div>
  ),
};

export const 면: Story = {
  render: () => (
    <div className="grid max-w-4xl gap-5 lg:grid-cols-[1fr_300px]">
      <Card className="p-5">
        <CardKicker>사람 정보</CardKicker>
        <div className="mt-1.5">
          <DetailRow label="이름">최시온</DetailRow>
          <DetailRow label="주민번호">9601**-*******</DetailRow>
          <DetailRow label="전화번호">010-2841-2277</DetailRow>
          <DetailRow label="이메일">sion@pius.co.kr</DetailRow>
        </div>
      </Card>

      <Panel>
        <CardKicker className="text-accent-800">등록 플로우</CardKicker>
        <ol className="mt-3 list-decimal pl-4 text-[13px] leading-loose">
          <li>인력 유형 선택</li>
          <li>필수 인력정보 입력</li>
          <li>계정 생성 (초기 비밀번호 0000)</li>
          <li>유형에 따른 권한 자동 적용</li>
        </ol>
      </Panel>
    </div>
  ),
};

export const 페이지헤더: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <PageHeader
        kicker="인사관리"
        title="인력 목록"
        actions={<Button variant="primary">인사 등록</Button>}
      />
      <PageHeader
        kicker="프로젝트관리"
        title="프로젝트 목록"
        description="본인이 참여한 프로젝트만 표시됩니다."
      />
    </div>
  ),
};

type Row = {
  id: number;
  name: string;
  client: string;
  period: string;
  amount: string;
  status: '예정' | '진행중' | '완료';
  overdue: boolean;
  owner: string;
};

const ROWS: Row[] = [
  {
    id: 1,
    name: '물류 통합관제 시스템 구축',
    client: '(주)대명물류',
    period: '2026-03-02 ~ 2026-09-30',
    amount: '212,000,000',
    status: '진행중',
    overdue: false,
    owner: '최시온',
  },
  {
    id: 2,
    name: '장비 이력관리 2차 개발',
    client: '(주)유진테크',
    period: '2025-11-10 ~ 2026-06-30',
    amount: '104,500,000',
    status: '진행중',
    overdue: true,
    owner: '김도현',
  },
  {
    id: 3,
    name: '전자결재 연동 개발',
    client: '세림전자(주)',
    period: '2026-09-01 ~ 2027-01-31',
    amount: '100,000,000',
    status: '예정',
    overdue: false,
    owner: '신예린',
  },
  {
    id: 4,
    name: '배송 정산 모듈 개선',
    client: '(주)대명물류',
    period: '2026-01-05 ~ 2026-04-30',
    amount: '86,000,000',
    status: '완료',
    overdue: false,
    owner: '김도현',
  },
];

const COLUMNS: Column<Row>[] = [
  { key: 'name', header: '프로젝트명', cell: (r) => <span className="font-medium">{r.name}</span> },
  { key: 'client', header: '거래처', cell: (r) => r.client, nowrap: true },
  {
    key: 'period',
    header: '계약기간',
    nowrap: true,
    tabular: true,
    // 계약기간이 지났는데 진행중이면 빨간 글씨로 표시한다
    cell: (r) => <span className={r.overdue ? 'text-danger' : undefined}>{r.period}</span>,
  },
  { key: 'amount', header: '계약금액', align: 'right', tabular: true, cell: (r) => r.amount },
  {
    key: 'status',
    header: '진행상태',
    width: 96,
    cell: (r) => (
      <Tag tone={r.status === '진행중' ? 'accent' : r.status === '예정' ? 'outline' : 'neutral'}>
        {r.status}
      </Tag>
    ),
  },
  { key: 'owner', header: '담당자', width: 86, cell: (r) => r.owner },
];

export const 테이블: Story = {
  render: function DataTable() {
    const [page, setPage] = useState(1);
    return (
      <div>
        <Card className="px-4 pt-1.5 pb-0.5">
          <Table columns={COLUMNS} rows={ROWS} rowKey={(r) => r.id} onRowClick={() => {}} />
        </Card>
        <Pagination page={page} totalPages={2} onChange={setPage} note="한 화면 12개" />
        <p className="text-muted mt-4 text-[12.5px]">
          행은 클릭뿐 아니라 Tab · Enter 로도 열 수 있다. 두 번째 행의 계약기간이 빨간 글씨다.
        </p>
      </div>
    );
  },
};

export const 탭: Story = {
  render: function DetailTabs() {
    const [tab, setTab] = useState('info');
    return (
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: 'info', label: '인사정보' },
          { value: 'projects', label: '프로젝트' },
        ]}
      >
        <TabPanel value="info">
          <Card className="p-5">
            <CardKicker>사람 정보</CardKicker>
            <DetailRow label="이름">최시온</DetailRow>
          </Card>
        </TabPanel>
        <TabPanel value="projects">
          <EmptyState
            title="참여한 프로젝트가 없습니다"
            description="프로젝트 상세에서 참여인력으로 추가하면 여기에 표시됩니다."
          />
        </TabPanel>
      </Tabs>
    );
  },
};

export const 빈상태: Story = {
  render: () => (
    <EmptyState
      title="검색 결과가 없습니다"
      description="다른 이름이나 전화번호로 검색해보세요."
      action={<Button variant="secondary">검색 초기화</Button>}
    />
  ),
};
