'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import type { ProjectCreateRequest } from '@/entities/project/types';
import { isApiError } from '@/shared/api/error';
import { formatMoneyInput, parseMoney } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';
import { Card, CardKicker, Panel } from '@/shared/ui/card';
import { Field } from '@/shared/ui/field';
import { Input } from '@/shared/ui/input';
import { PageHeader } from '@/shared/ui/page-header';
import { Select } from '@/shared/ui/select';
import { useToast } from '@/shared/ui/toast';
import { useClientOptions, useCreateProject, usePersonOptions } from '../hooks/use-projects';

type Draft = {
  name: string;
  clientId: string;
  contractStartDate: string;
  contractEndDate: string;
  contractAmount: string;
  ownerId: string;
};

const EMPTY: Draft = {
  name: '',
  clientId: '',
  contractStartDate: '',
  contractEndDate: '',
  contractAmount: '',
  ownerId: '',
};

function localErrors(draft: Draft): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!draft.name.trim()) errors.name = '프로젝트명을 입력해주세요.';
  if (!draft.clientId) errors.clientId = '거래처를 선택해주세요.';
  if (!draft.contractStartDate) errors.contractStartDate = '계약 시작일을 입력해주세요.';
  if (!draft.contractEndDate) errors.contractEndDate = '계약 종료일을 입력해주세요.';
  if (
    draft.contractStartDate &&
    draft.contractEndDate &&
    draft.contractEndDate < draft.contractStartDate
  ) {
    errors.contractEndDate = '종료일은 시작일보다 빠를 수 없습니다.';
  }
  return errors;
}

export function ProjectCreateForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const create = useCreateProject();
  const clients = useClientOptions();
  const persons = usePersonOptions();

  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  // 업무 담당자는 재직 중인 정직원만 지정할 수 있다.
  const owners = (persons.data?.content ?? []).filter(
    (person) => person.employmentType === 'EMPLOYEE' && person.employmentStatus === 'ACTIVE',
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const found = localErrors(draft);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setErrors({});

    const body: ProjectCreateRequest = {
      name: draft.name.trim(),
      clientId: Number(draft.clientId),
      contractStartDate: draft.contractStartDate,
      contractEndDate: draft.contractEndDate,
      contractAmount: parseMoney(draft.contractAmount),
      ownerId: draft.ownerId ? Number(draft.ownerId) : null,
    };

    try {
      const result = await create.mutateAsync(body);
      showToast(`${body.name} 을(를) 개설했습니다.`);
      router.replace(`/projects/${result.projectId}`);
    } catch (error) {
      if (isApiError(error)) {
        setErrors(error.fields ?? {});
        if (!error.fields) showToast(error.message);
      } else {
        showToast('일시적인 오류가 발생했습니다.');
      }
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

      <PageHeader
        title="프로젝트 개설"
        description="개설 시에는 최소 정보만 입력합니다. 실제 종료일 · 참여인력 · 계약서는 상세에서 입력합니다."
      />

      <form
        onSubmit={handleSubmit}
        className="grid [grid-template-columns:minmax(0,660px)_300px] items-start gap-6"
      >
        <Card className="p-6">
          <div className="grid grid-cols-2 gap-x-4.5 gap-y-3.5">
            <Field label="프로젝트명" required className="col-span-2" error={errors.name}>
              {({ id, invalid }) => (
                <Input
                  id={id}
                  invalid={invalid}
                  placeholder="물류 통합관제 시스템 구축"
                  value={draft.name}
                  onChange={(e) => set('name', e.target.value)}
                />
              )}
            </Field>

            <Field
              label="거래처"
              required
              hint="등록된 거래처 선택"
              className="col-span-2"
              error={errors.clientId}
            >
              {({ id, invalid }) => (
                <Select
                  id={id}
                  invalid={invalid}
                  value={draft.clientId}
                  onChange={(e) => set('clientId', e.target.value)}
                >
                  <option value="">거래처를 선택하세요</option>
                  {clients.data?.content.map((client) => (
                    <option key={client.clientId} value={client.clientId}>
                      {client.name}
                    </option>
                  ))}
                </Select>
              )}
            </Field>

            <Field label="계약 시작일" required error={errors.contractStartDate}>
              {({ id, invalid }) => (
                <Input
                  id={id}
                  invalid={invalid}
                  type="date"
                  max={draft.contractEndDate || undefined}
                  value={draft.contractStartDate}
                  onChange={(e) => set('contractStartDate', e.target.value)}
                />
              )}
            </Field>

            <Field label="계약 종료일" required error={errors.contractEndDate}>
              {({ id, invalid }) => (
                <Input
                  id={id}
                  invalid={invalid}
                  type="date"
                  min={draft.contractStartDate || undefined}
                  value={draft.contractEndDate}
                  onChange={(e) => set('contractEndDate', e.target.value)}
                />
              )}
            </Field>

            <p className="text-muted col-span-2 -mt-1 text-[11.5px]">
              종료일은 시작일 이전으로 선택할 수 없습니다.
            </p>

            <Field label="계약금액" hint="세 자리 콤마 자동" error={errors.contractAmount}>
              {({ id, invalid }) => (
                <Input
                  id={id}
                  invalid={invalid}
                  className="tabular text-right"
                  placeholder="0"
                  value={draft.contractAmount}
                  onChange={(e) => set('contractAmount', e.target.value)}
                  onBlur={() => set('contractAmount', formatMoneyInput(draft.contractAmount))}
                />
              )}
            </Field>

            <Field label="업무 담당자" hint="정직원 선택" error={errors.ownerId}>
              {({ id, invalid }) => (
                <Select
                  id={id}
                  invalid={invalid}
                  value={draft.ownerId}
                  onChange={(e) => set('ownerId', e.target.value)}
                >
                  <option value="">선택 없음</option>
                  {owners.map((person) => (
                    <option key={person.personId} value={person.personId}>
                      {person.name}
                      {person.jobTitle ? ` · ${person.jobTitle}` : ''}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>

          <div className="mt-5 flex gap-2.5">
            <Button type="submit" variant="primary" disabled={create.isPending}>
              {create.isPending ? '개설 중…' : '개설'}
            </Button>
            <Button variant="secondary" onClick={() => router.push('/projects')}>
              취소
            </Button>
          </div>
        </Card>

        <Panel>
          <CardKicker className="text-accent-800 mb-2.5">계약기간 ≠ 운영기간</CardKicker>
          <p className="mb-3 text-[12.5px] leading-[1.75]">
            계약 종료일과 실제 종료일은 서로 독립적으로 관리합니다. 실제 종료일은 프로젝트 상세에서
            입력합니다.
          </p>
          <div className="font-heading text-[12.5px] leading-loose">
            <div>계약기간 6/1 ─── 8/31</div>
            <div>실제운영 6/10 ─── 9/5</div>
          </div>
        </Panel>
      </form>
    </>
  );
}
