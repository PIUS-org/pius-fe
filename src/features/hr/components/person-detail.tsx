'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { employmentStatusTone, hiredAtLabel, leaveAtLabel } from '@/entities/person/status';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { TabPanel, Tabs } from '@/shared/ui/tabs';
import { Tag } from '@/shared/ui/tag';
import { usePersonDetail } from '../hooks/use-persons';
import { PersonInfoTab } from './person-info-tab';
import { PersonProjectTab } from './person-project-tab';

const TABS = [
  { value: 'info', label: '인사정보' },
  { value: 'projects', label: '프로젝트' },
] as const;

export function PersonDetail({ personId }: { personId: number }) {
  const router = useRouter();
  const [tab, setTab] = useState<string>('info');
  const { data: person, isPending, isError, error } = usePersonDetail(personId);

  if (isPending) {
    return <p className="text-muted py-16 text-center text-[13px]">불러오는 중…</p>;
  }

  if (isError || !person) {
    return (
      <EmptyState
        title="인력 정보를 불러오지 못했습니다"
        description={error instanceof Error ? error.message : undefined}
        action={
          <Button variant="secondary" onClick={() => router.push('/hr')}>
            인력 목록으로
          </Button>
        }
      />
    );
  }

  const dateLabel = person.leaveAt
    ? `${person.hiredAt} ${hiredAtLabel(person.employmentType)} · ${person.leaveAt} ${leaveAtLabel(person.employmentType)}`
    : `${person.hiredAt} ${hiredAtLabel(person.employmentType)}`;

  return (
    <>
      <Button variant="secondary" size="sm" className="mb-3.5" onClick={() => router.push('/hr')}>
        ← 인력 목록
      </Button>

      <Card className="mb-4.5 px-6 py-5">
        <div className="flex items-start justify-between gap-5">
          <div>
            <h2 className="font-heading text-[30px] leading-tight">{person.name}</h2>
            <div className="mt-2 flex items-center gap-2.5">
              <Tag tone="neutral">{person.employmentTypeLabel}</Tag>
              <Tag tone={employmentStatusTone(person.employmentStatus)}>
                {person.employmentStatusLabel}
              </Tag>
              <span className="text-muted-strong text-[13px]">
                {person.jobTitle ? `${person.jobTitle} · ` : ''}
                {dateLabel}
              </span>
            </div>
          </div>

          <div className="flex gap-6 text-right">
            <div>
              <div className="text-muted-weak text-[11px] tracking-[0.1em] uppercase">
                참여 프로젝트
              </div>
              <div className="font-heading text-[26px]">{person.projectSummary.total}</div>
            </div>
            <div>
              <div className="text-muted-weak text-[11px] tracking-[0.1em] uppercase">진행중</div>
              <div className="font-heading text-[26px]">{person.projectSummary.inProgress}</div>
            </div>
          </div>
        </div>
      </Card>

      <Tabs items={TABS} value={tab} onChange={setTab}>
        <TabPanel value="info">
          {/* 서버 데이터가 바뀌면 초안을 새로 잡도록 key 를 준다. */}
          <PersonInfoTab key={person.personId + person.employmentStatus} person={person} />
        </TabPanel>
        <TabPanel value="projects">
          <PersonProjectTab personId={personId} active={tab === 'projects'} />
        </TabPanel>
      </Tabs>
    </>
  );
}
