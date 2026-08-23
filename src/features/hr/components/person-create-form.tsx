'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import type { EmploymentType, PersonCreateRequest } from '@/entities/person/types';
import { isApiError } from '@/shared/api/error';
import { formatPhone } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';
import { Card, CardKicker, Panel } from '@/shared/ui/card';
import { Field } from '@/shared/ui/field';
import { Input } from '@/shared/ui/input';
import { PageHeader } from '@/shared/ui/page-header';
import { RadioGroup } from '@/shared/ui/radio';
import { useToast } from '@/shared/ui/toast';
import { useCreatePerson } from '../hooks/use-persons';

/** 서버가 필드별 메시지를 내려주므로 화면은 형식만 미리 걸러 왕복을 줄인다. */
function localErrors(form: PersonCreateRequest): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.name.trim()) errors.name = '이름을 입력해주세요.';
  if (!/^\d{6}-?\d{7}$/.test(form.rrn)) errors.rrn = '주민등록번호는 숫자 13자리로 입력해주세요.';
  if (!form.hiredAt) errors.hiredAt = '입사일을 입력해주세요.';
  if (!/^[0-9-]{10,13}$/.test(form.phone)) errors.phone = '휴대전화를 숫자로 입력해주세요.';
  if (!form.address.trim()) errors.address = '주소를 입력해주세요.';
  if (!/^[a-zA-Z0-9]{1,20}$/.test(form.loginId))
    errors.loginId = '아이디는 영문과 숫자만 20자 이내로 입력해주세요.';
  return errors;
}

const EMPTY: PersonCreateRequest = {
  name: '',
  rrn: '',
  employmentType: 'EMPLOYEE',
  hiredAt: '',
  phone: '',
  address: '',
  email: '',
  loginId: '',
};

export function PersonCreateForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const create = useCreatePerson();

  const [form, setForm] = useState<PersonCreateRequest>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof PersonCreateRequest>(key: K, value: PersonCreateRequest[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

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
        ...form,
        email: form.email?.trim() ? form.email.trim() : undefined,
      });
      showToast(`${form.name} 님을 등록했습니다. 초기 비밀번호는 0000 입니다.`);
      router.replace(`/hr/${result.personId}`);
    } catch (error) {
      if (isApiError(error)) {
        // 서버가 필드별 메시지를 주면 해당 인풋 아래에 그대로 붙인다.
        setErrors(error.fields ?? {});
        if (!error.fields) showToast(error.message);
      } else {
        showToast('일시적인 오류가 발생했습니다.');
      }
    }
  }

  return (
    <>
      <Button variant="secondary" size="sm" className="mb-3.5" onClick={() => router.push('/hr')}>
        ← 인력 목록
      </Button>

      <PageHeader
        title="인사 등록"
        description="등록을 최종 완료하는 시점에 계정이 함께 생성되며, 고용형태에 따라 권한이 자동 적용됩니다."
      />

      <form
        onSubmit={handleSubmit}
        className="grid [grid-template-columns:minmax(0,700px)_300px] items-start gap-6"
      >
        <div className="flex flex-col gap-5">
          <Card className="p-5.5">
            <CardKicker className="mb-3.5">필수 인력정보</CardKicker>
            <div className="grid grid-cols-2 gap-x-4.5 gap-y-3.5">
              <Field label="이름" required error={errors.name}>
                {({ id, invalid }) => (
                  <Input
                    id={id}
                    invalid={invalid}
                    placeholder="홍길동"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                  />
                )}
              </Field>

              <Field label="주민등록번호" required hint="민감정보 · 숫자 13자리" error={errors.rrn}>
                {({ id, invalid }) => (
                  <Input
                    id={id}
                    invalid={invalid}
                    placeholder="000000-0000000"
                    value={form.rrn}
                    onChange={(e) => set('rrn', e.target.value)}
                  />
                )}
              </Field>

              <Field label="고용형태" required className="col-span-2">
                {() => (
                  <div className="pt-1.5">
                    <RadioGroup
                      name="employmentType"
                      value={form.employmentType}
                      onChange={(value) => set('employmentType', value as EmploymentType)}
                      options={[
                        { value: 'EMPLOYEE', label: '정직원' },
                        { value: 'CONTRACTOR', label: '용역' },
                      ]}
                    />
                  </div>
                )}
              </Field>

              <Field label="입사일" required error={errors.hiredAt}>
                {({ id, invalid }) => (
                  <Input
                    id={id}
                    invalid={invalid}
                    type="date"
                    value={form.hiredAt}
                    onChange={(e) => set('hiredAt', e.target.value)}
                  />
                )}
              </Field>

              <Field
                label="휴대전화"
                required
                hint="숫자만 입력 · 자동 하이픈"
                error={errors.phone}
              >
                {({ id, invalid }) => (
                  <Input
                    id={id}
                    invalid={invalid}
                    placeholder="000-0000-0000"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    // 입력 중에 하이픈을 넣으면 캐럿이 튄다. blur 에서만 정리한다.
                    onBlur={() => set('phone', formatPhone(form.phone))}
                  />
                )}
              </Field>

              <Field label="주소" required className="col-span-2" error={errors.address}>
                {({ id, invalid }) => (
                  <Input
                    id={id}
                    invalid={invalid}
                    placeholder="도로명 주소"
                    value={form.address}
                    onChange={(e) => set('address', e.target.value)}
                  />
                )}
              </Field>

              <Field label="이메일" error={errors.email}>
                {({ id, invalid }) => (
                  <Input
                    id={id}
                    invalid={invalid}
                    type="email"
                    placeholder="name@pius.co.kr"
                    value={form.email ?? ''}
                    onChange={(e) => set('email', e.target.value)}
                  />
                )}
              </Field>
            </div>
          </Card>

          <Card className="p-5.5">
            <CardKicker className="mb-3.5">계정 생성</CardKicker>
            <div className="grid grid-cols-2 gap-x-4.5 gap-y-3.5">
              <Field label="아이디" required hint="영문+숫자 20자 이내" error={errors.loginId}>
                {({ id, invalid }) => (
                  <Input
                    id={id}
                    invalid={invalid}
                    placeholder="honggildong"
                    value={form.loginId}
                    onChange={(e) => set('loginId', e.target.value)}
                  />
                )}
              </Field>
              <Field label="초기 비밀번호">
                {({ id }) => <Input id={id} value="0000" readOnly />}
              </Field>
            </div>
          </Card>

          <div className="flex gap-2.5">
            <Button type="submit" variant="primary" disabled={create.isPending}>
              {create.isPending ? '등록 중…' : '등록 완료 · 계정 생성'}
            </Button>
            <Button variant="secondary" onClick={() => router.push('/hr')}>
              취소
            </Button>
          </div>
        </div>

        <Panel>
          <CardKicker className="text-accent-800 mb-3">등록 플로우</CardKicker>
          <ol className="list-decimal pl-4 text-[13px] leading-[1.9]">
            <li>인력 유형 선택</li>
            <li>필수 인력정보 입력</li>
            <li>계정 생성 (초기 비밀번호 0000)</li>
            <li>유형에 따른 권한 자동 적용</li>
          </ol>
          <div className="bg-divider my-4 h-px" />
          <p className="text-[12px] leading-[1.75]">
            직무 · 계약서는 등록 이후 인사 상세에서 입력합니다. 입력 중 취소하거나 등록에 실패하면
            계정은 생성되지 않습니다.
          </p>
        </Panel>
      </form>
    </>
  );
}
