'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import type { ClientCreateRequest } from '@/entities/client/types';
import { isApiError } from '@/shared/api/error';
import { formatBizRegNo, formatPhone } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Field } from '@/shared/ui/field';
import { Input } from '@/shared/ui/input';
import { PageHeader } from '@/shared/ui/page-header';
import { Textarea } from '@/shared/ui/textarea';
import { useToast } from '@/shared/ui/toast';
import { useCreateClient } from '../hooks/use-clients';

const EMPTY: ClientCreateRequest = {
  name: '',
  bizRegNo: '',
  ceoName: '',
  industry: '',
  tel: '',
  address: '',
  email: '',
  homepage: '',
  description: '',
};

function localErrors(form: ClientCreateRequest): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.name.trim()) errors.name = '거래처명을 입력해주세요.';
  if (!/^\d{3}-?\d{2}-?\d{5}$/.test(form.bizRegNo))
    errors.bizRegNo = '사업자등록번호는 숫자 10자리로 입력해주세요.';
  if (!form.ceoName.trim()) errors.ceoName = '대표자명을 입력해주세요.';
  return errors;
}

export function ClientCreateForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const create = useCreateClient();

  const [form, setForm] = useState<ClientCreateRequest>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof ClientCreateRequest>(key: K, value: ClientCreateRequest[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  /** 빈 문자열은 보내지 않는다. 서버가 선택 항목을 빈 값으로 덮어쓰지 않게 한다. */
  const trimmed = (value?: string) => (value?.trim() ? value.trim() : undefined);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const found = localErrors(form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    setErrors({});

    try {
      const result = await create.mutateAsync({
        name: form.name.trim(),
        bizRegNo: form.bizRegNo,
        ceoName: form.ceoName.trim(),
        industry: trimmed(form.industry),
        tel: trimmed(form.tel),
        address: trimmed(form.address),
        email: trimmed(form.email),
        homepage: trimmed(form.homepage),
        description: trimmed(form.description),
      });
      showToast(`${form.name} 을(를) 등록했습니다.`);
      router.replace(`/clients/${result.clientId}`);
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
        onClick={() => router.push('/clients')}
      >
        ← 거래처 목록
      </Button>

      <PageHeader
        title="거래처 등록"
        description="기본정보만 먼저 등록합니다. 담당자 · 요구사항 · 프로젝트 · 문서는 등록 후 상세에서 추가합니다."
      />

      <form onSubmit={handleSubmit}>
        <Card className="max-w-[760px] p-6">
          <div className="grid grid-cols-2 gap-x-4.5 gap-y-3.5">
            <Field label="거래처명" required error={errors.name}>
              {({ id, invalid }) => (
                <Input
                  id={id}
                  invalid={invalid}
                  placeholder="(주)대명물류"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                />
              )}
            </Field>

            <Field
              label="사업자등록번호"
              required
              hint="숫자 10자리 · 중복 등록 불가"
              error={errors.bizRegNo}
            >
              {({ id, invalid }) => (
                <Input
                  id={id}
                  invalid={invalid}
                  placeholder="000-00-00000"
                  value={form.bizRegNo}
                  onChange={(e) => set('bizRegNo', e.target.value)}
                  onBlur={() => set('bizRegNo', formatBizRegNo(form.bizRegNo) || form.bizRegNo)}
                />
              )}
            </Field>

            <Field label="대표자명" required error={errors.ceoName}>
              {({ id, invalid }) => (
                <Input
                  id={id}
                  invalid={invalid}
                  value={form.ceoName}
                  onChange={(e) => set('ceoName', e.target.value)}
                />
              )}
            </Field>

            <Field label="업종">
              {({ id }) => (
                <Input
                  id={id}
                  value={form.industry ?? ''}
                  onChange={(e) => set('industry', e.target.value)}
                />
              )}
            </Field>

            <Field label="대표전화">
              {({ id }) => (
                <Input
                  id={id}
                  placeholder="02-000-0000"
                  value={form.tel ?? ''}
                  onChange={(e) => set('tel', e.target.value)}
                  onBlur={() => set('tel', formatPhone(form.tel))}
                />
              )}
            </Field>

            <Field label="대표 이메일" error={errors.email}>
              {({ id, invalid }) => (
                <Input
                  id={id}
                  invalid={invalid}
                  type="email"
                  value={form.email ?? ''}
                  onChange={(e) => set('email', e.target.value)}
                />
              )}
            </Field>

            <Field label="사업장 주소" className="col-span-2">
              {({ id }) => (
                <Input
                  id={id}
                  value={form.address ?? ''}
                  onChange={(e) => set('address', e.target.value)}
                />
              )}
            </Field>

            <Field label="홈페이지" className="col-span-2">
              {({ id }) => (
                <Input
                  id={id}
                  placeholder="https://"
                  value={form.homepage ?? ''}
                  onChange={(e) => set('homepage', e.target.value)}
                />
              )}
            </Field>

            <Field label="거래처 설명" className="col-span-2">
              {({ id }) => (
                <Textarea
                  id={id}
                  placeholder="거래처에 대한 참고사항"
                  value={form.description ?? ''}
                  onChange={(e) => set('description', e.target.value)}
                />
              )}
            </Field>
          </div>

          <div className="mt-5 flex gap-2.5">
            <Button type="submit" variant="primary" disabled={create.isPending}>
              {create.isPending ? '등록 중…' : '등록'}
            </Button>
            <Button variant="secondary" onClick={() => router.push('/clients')}>
              취소
            </Button>
          </div>
        </Card>
      </form>
    </>
  );
}
