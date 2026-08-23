'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { clientStatusTone } from '@/entities/client/status';
import { useAttachments } from '@/features/attachment/use-attachments';
import { formatMoney } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';
import { Card, CardKicker } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { FileUpload } from '@/shared/ui/file-upload';
import { TabPanel, Tabs } from '@/shared/ui/tabs';
import { Tag } from '@/shared/ui/tag';
import { clientKeys } from '../api/client.api';
import { useClientDetail } from '../hooks/use-clients';
import { ClientBasicTab } from './client-basic-tab';
import { ClientWorkTab } from './client-work-tab';

const TABS = [
  { value: 'basic', label: '기본정보' },
  { value: 'work', label: '업무정보' },
  { value: 'doc', label: '문서' },
] as const;

export function ClientDetail({ clientId }: { clientId: number }) {
  const router = useRouter();
  const [tab, setTab] = useState<string>('basic');
  const { data: client, isPending, isError, error } = useClientDetail(clientId);
  const attachments = useAttachments('CLIENT_BIZ_LICENSE', clientId, clientKeys.detail(clientId));

  if (isPending) {
    return <p className="text-muted py-16 text-center text-[13px]">불러오는 중…</p>;
  }

  if (isError || !client) {
    return (
      <EmptyState
        title="거래처 정보를 불러오지 못했습니다"
        description={error instanceof Error ? error.message : undefined}
        action={
          <Button variant="secondary" onClick={() => router.push('/clients')}>
            거래처 목록으로
          </Button>
        }
      />
    );
  }

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        className="mb-3.5"
        onClick={() => router.push('/clients')}
      >
        ← 거래처 목록
      </Button>

      <Card className="mb-4.5 px-6 py-5">
        <div className="flex items-start justify-between gap-5">
          <div>
            <h2 className="font-heading text-[30px] leading-tight">{client.name}</h2>
            <div className="mt-2 flex items-center gap-2.5">
              <Tag tone={clientStatusTone(client.summary.status)}>{client.summary.statusLabel}</Tag>
              <span className="text-muted-strong text-[13px]">
                {client.bizRegNo} · 대표 {client.ceoName}
              </span>
            </div>
          </div>

          <div className="flex gap-6 text-right">
            <div>
              <div className="text-muted-weak text-[11px] tracking-[0.1em] uppercase">프로젝트</div>
              <div className="font-heading text-[26px]">{client.summary.projectCount}</div>
            </div>
            <div>
              <div className="text-muted-weak text-[11px] tracking-[0.1em] uppercase">
                누적 계약액
              </div>
              <div className="font-heading tabular text-[26px]">
                {formatMoney(client.summary.totalContractAmount)}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Tabs items={TABS} value={tab} onChange={setTab}>
        <TabPanel value="basic">
          {/* 서버 데이터가 바뀌면 초안을 새로 잡도록 key 를 준다. */}
          <ClientBasicTab key={client.bizRegNo + client.managers.length} client={client} />
        </TabPanel>
        <TabPanel value="work">
          <ClientWorkTab client={client} active={tab === 'work'} />
        </TabPanel>
        <TabPanel value="doc">
          <Card className="max-w-[620px] p-5.5">
            <CardKicker className="mb-3">사업자 등록증</CardKicker>
            <FileUpload
              files={client.attachments}
              onSelect={attachments.onSelect}
              onOpen={attachments.onOpen}
              onDelete={attachments.onDelete}
            />
          </Card>
        </TabPanel>
      </Tabs>
    </>
  );
}
