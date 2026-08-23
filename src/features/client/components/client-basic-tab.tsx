'use client';

import { useState } from 'react';
import { clientStatusTone } from '@/entities/client/status';
import type { ClientDetail, ClientUpdateRequest } from '@/entities/client/types';
import { isApiError } from '@/shared/api/error';
import { formatBizRegNo, formatPhone } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';
import { Card, CardKicker } from '@/shared/ui/card';
import { Dialog } from '@/shared/ui/dialog';
import { Field } from '@/shared/ui/field';
import { Input } from '@/shared/ui/input';
import { Tag } from '@/shared/ui/tag';
import { Textarea } from '@/shared/ui/textarea';
import { useToast } from '@/shared/ui/toast';
import { useClientManagers, useUpdateClient } from '../hooks/use-clients';

type Draft = Required<Omit<ClientUpdateRequest, 'notes'>>;

function draftOf(client: ClientDetail): Draft {
  return {
    name: client.name,
    bizRegNo: client.bizRegNo,
    ceoName: client.ceoName,
    industry: client.industry ?? '',
    tel: client.tel ?? '',
    address: client.address ?? '',
    email: client.email ?? '',
    homepage: client.homepage ?? '',
    description: client.description ?? '',
  };
}

export function ClientBasicTab({ client }: { client: ClientDetail }) {
  const { showToast } = useToast();
  const update = useUpdateClient(client.clientId);
  const managers = useClientManagers(client.clientId);

  const [draft, setDraft] = useState<Draft>(() => draftOf(client));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [managerOpen, setManagerOpen] = useState(false);

  const original = draftOf(client);
  const dirty = (Object.keys(original) as (keyof Draft)[]).some((k) => draft[k] !== original[k]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  async function save() {
    const body: ClientUpdateRequest = {};
    for (const key of Object.keys(original) as (keyof Draft)[]) {
      if (draft[key] !== original[key]) body[key] = draft[key];
    }
    setErrors({});
    try {
      await update.mutateAsync(body);
      showToast('변경사항을 저장했습니다.');
    } catch (error) {
      if (isApiError(error)) {
        setErrors(error.fields ?? {});
        if (!error.fields) showToast(error.message);
      } else {
        showToast('일시적인 오류가 발생했습니다.');
      }
    }
  }

  async function addManager(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = (key: string) => String(form.get(key) ?? '').trim() || undefined;

    try {
      await managers.add.mutateAsync({
        name: String(form.get('name') ?? '').trim(),
        title: value('title'),
        phone: value('phone'),
        email: value('email'),
        primary: client.managers.length === 0,
      });
      setManagerOpen(false);
      showToast('담당자를 추가했습니다.');
    } catch (error) {
      showToast(isApiError(error) ? error.message : '담당자 추가에 실패했습니다.');
    }
  }

  return (
    <div className="grid [grid-template-columns:minmax(520px,1fr)_360px] items-start gap-5">
      <Card className="px-5.5 py-5">
        <CardKicker className="mb-3.5">거래처 정보</CardKicker>
        <div className="grid grid-cols-2 gap-x-4.5 gap-y-3">
          <Field label="거래처명" error={errors.name}>
            {({ id, invalid }) => (
              <Input
                id={id}
                invalid={invalid}
                value={draft.name}
                onChange={(e) => set('name', e.target.value)}
              />
            )}
          </Field>
          <Field label="사업자등록번호" error={errors.bizRegNo}>
            {({ id, invalid }) => (
              <Input
                id={id}
                invalid={invalid}
                value={draft.bizRegNo}
                onChange={(e) => set('bizRegNo', e.target.value)}
                onBlur={() => set('bizRegNo', formatBizRegNo(draft.bizRegNo) || draft.bizRegNo)}
              />
            )}
          </Field>
          <Field label="대표자명" error={errors.ceoName}>
            {({ id, invalid }) => (
              <Input
                id={id}
                invalid={invalid}
                value={draft.ceoName}
                onChange={(e) => set('ceoName', e.target.value)}
              />
            )}
          </Field>
          <Field label="업종">
            {({ id }) => (
              <Input
                id={id}
                value={draft.industry}
                onChange={(e) => set('industry', e.target.value)}
              />
            )}
          </Field>
          <Field label="대표전화">
            {({ id }) => (
              <Input
                id={id}
                value={draft.tel}
                onChange={(e) => set('tel', e.target.value)}
                onBlur={() => set('tel', formatPhone(draft.tel))}
              />
            )}
          </Field>
          <Field label="대표 이메일" error={errors.email}>
            {({ id, invalid }) => (
              <Input
                id={id}
                invalid={invalid}
                type="email"
                value={draft.email}
                onChange={(e) => set('email', e.target.value)}
              />
            )}
          </Field>
          <Field label="사업장 주소" className="col-span-2">
            {({ id }) => (
              <Input
                id={id}
                value={draft.address}
                onChange={(e) => set('address', e.target.value)}
              />
            )}
          </Field>
          <Field label="홈페이지" className="col-span-2">
            {({ id }) => (
              <Input
                id={id}
                value={draft.homepage}
                onChange={(e) => set('homepage', e.target.value)}
              />
            )}
          </Field>
          <Field label="거래처 설명" className="col-span-2">
            {({ id }) => (
              <Textarea
                id={id}
                value={draft.description}
                onChange={(e) => set('description', e.target.value)}
              />
            )}
          </Field>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Button variant="primary" disabled={!dirty || update.isPending} onClick={save}>
            {update.isPending ? '저장 중…' : '변경사항 저장'}
          </Button>
          <Button variant="secondary" disabled={!dirty} onClick={() => setDraft(draftOf(client))}>
            되돌리기
          </Button>
        </div>
      </Card>

      <div className="flex flex-col gap-4.5">
        <Card className="px-5.5 py-5">
          <div className="mb-2.5 flex items-center justify-between">
            <CardKicker>담당자</CardKicker>
            <Button variant="ghost" size="sm" onClick={() => setManagerOpen(true)}>
              담당자 추가
            </Button>
          </div>

          {client.managers.length === 0 ? (
            <p className="text-muted py-2 text-[12.5px]">등록된 담당자가 없습니다.</p>
          ) : (
            client.managers.map((manager) => (
              <div
                key={manager.managerId}
                className="border-divider flex items-start gap-2 border-t py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">
                    {manager.name}
                    {manager.title && (
                      <span className="text-muted ml-1 text-[12.5px] font-normal">
                        {manager.title}
                      </span>
                    )}
                    {manager.primary && (
                      <span className="text-accent-700 ml-1.5 text-[11px]">주 담당</span>
                    )}
                  </div>
                  <div className="text-muted-strong mt-0.5 text-[12.5px]">
                    {[manager.phone, manager.email].filter(Boolean).join(' · ') || '-'}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => managers.remove.mutate(manager.managerId)}
                >
                  삭제
                </Button>
              </div>
            ))
          )}
          <p className="text-muted mt-3 text-[11.5px]">담당자 항목은 추후 상세 기획 예정입니다.</p>
        </Card>

        <Card className="px-5.5 py-5">
          <CardKicker className="mb-2.5">진행여부</CardKicker>
          <div className="flex items-center gap-2.5">
            <Tag tone={clientStatusTone(client.summary.status)}>{client.summary.statusLabel}</Tag>
            <span className="text-muted text-[12.5px]">프로젝트 상태로 자동 판정</span>
          </div>
        </Card>
      </div>

      <Dialog
        open={managerOpen}
        onOpenChange={setManagerOpen}
        title="담당자 추가"
        description="거래처 실무 담당자를 등록합니다. 여러 명 등록할 수 있습니다."
        width={460}
      >
        <form onSubmit={addManager}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="이름" required>
              {({ id }) => <Input id={id} name="name" required autoFocus />}
            </Field>
            <Field label="직책">
              {({ id }) => <Input id={id} name="title" placeholder="과장" />}
            </Field>
            <Field label="전화번호">
              {({ id }) => <Input id={id} name="phone" placeholder="숫자만 입력" />}
            </Field>
            <Field label="이메일">{({ id }) => <Input id={id} name="email" type="email" />}</Field>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setManagerOpen(false)}>
              취소
            </Button>
            <Button type="submit" variant="primary" disabled={managers.add.isPending}>
              추가
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
