import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { Button } from '../button';
import { Field } from '../field';
import { Input } from '../input';
import { RadioGroup } from '../radio';
import { Segmented } from '../segmented';
import { Select } from '../select';
import { Textarea } from '../textarea';
import { formatMoneyInput, formatPhone } from '@/shared/lib/format';

const meta = {
  title: 'Components/폼',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const 버튼: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary">등록 완료 · 계정 생성</Button>
        <Button variant="secondary">취소</Button>
        <Button variant="ghost">담당자 추가</Button>
        <Button variant="primary" disabled>
          비활성
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm">sm</Button>
        <Button size="md">md</Button>
        <Button variant="primary" size="lg">
          lg (로그인)
        </Button>
        <Button size="icon" aria-label="아이콘">
          ›
        </Button>
      </div>
      <div className="bg-accent-900 flex gap-3 p-4">
        <Button variant="inverse" block>
          로그아웃 (사이드바용 inverse)
        </Button>
      </div>
      <div className="max-w-xs">
        <Button variant="primary" size="lg" block>
          로그인
        </Button>
      </div>
    </div>
  ),
};

export const 입력: Story = {
  render: function InputFields() {
    const [phone, setPhone] = useState('01012345678');
    const [amount, setAmount] = useState('212000000');

    return (
      <div className="grid max-w-2xl gap-4">
        <Field label="이름" required>
          {({ id }) => <Input id={id} placeholder="홍길동" />}
        </Field>

        <Field label="휴대전화" required hint="숫자만 입력 · 자동 하이픈">
          {({ id }) => (
            <Input
              id={id}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={() => setPhone(formatPhone(phone))}
              placeholder="000-0000-0000"
            />
          )}
        </Field>

        <Field label="계약금액" hint="세 자리 콤마 자동">
          {({ id }) => (
            <Input
              id={id}
              className="tabular text-right"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onBlur={() => setAmount(formatMoneyInput(amount))}
            />
          )}
        </Field>

        <Field label="아이디" required error="이미 사용 중인 아이디입니다.">
          {({ id, invalid }) => <Input id={id} invalid={invalid} defaultValue="siochoi" />}
        </Field>

        <Field label="초기 비밀번호">{({ id }) => <Input id={id} value="0000" readOnly />}</Field>

        <Field label="거래처" required hint="등록된 거래처 선택">
          {({ id }) => (
            <Select id={id} defaultValue="">
              <option value="" disabled>
                거래처를 선택하세요
              </option>
              <option>(주)대명물류</option>
              <option>세림전자(주)</option>
              <option>한빛에너지</option>
            </Select>
          )}
        </Field>

        <Field label="프로젝트 상세내용">
          {({ id }) => (
            <Textarea
              id={id}
              defaultValue="창고 · 차량 · 배송 데이터를 단일 관제 화면으로 통합한다."
            />
          )}
        </Field>
      </div>
    );
  },
};

export const 선택: Story = {
  render: function ChoiceControls() {
    const [type, setType] = useState<'EMPLOYEE' | 'CONTRACTOR'>('EMPLOYEE');
    const [active, setActive] = useState<'active' | 'inactive'>('active');
    const [status, setStatus] = useState<'ALL' | 'ACTIVE' | 'RESIGNED'>('ALL');
    const [projectStatus, setProjectStatus] = useState('ALL');

    return (
      <div className="flex flex-col gap-8">
        <Field label="고용형태" required>
          {() => (
            <RadioGroup
              name="employmentType"
              value={type}
              onChange={setType}
              options={[
                { value: 'EMPLOYEE', label: '정직원' },
                { value: 'CONTRACTOR', label: '용역' },
              ]}
            />
          )}
        </Field>

        <Field label="비활성화" hint="용역만 노출">
          {() => (
            <RadioGroup
              name="active"
              value={active}
              onChange={setActive}
              options={[
                { value: 'active', label: '활성' },
                { value: 'inactive', label: '비활성화' },
              ]}
            />
          )}
        </Field>

        <div>
          <div className="text-muted mb-2 text-xs">인력 목록 필터</div>
          <Segmented
            label="재직여부"
            value={status}
            onChange={setStatus}
            options={[
              { value: 'ALL', label: '전체' },
              { value: 'ACTIVE', label: '재직' },
              { value: 'RESIGNED', label: '퇴사' },
            ]}
          />
        </div>

        <div>
          <div className="text-muted mb-2 text-xs">프로젝트 목록 필터</div>
          <Segmented
            label="진행상태"
            value={projectStatus}
            onChange={setProjectStatus}
            options={[
              { value: 'ALL', label: '전체' },
              { value: 'PLANNED', label: '예정' },
              { value: 'IN_PROGRESS', label: '진행중' },
              { value: 'COMPLETED', label: '완료' },
            ]}
          />
        </div>
      </div>
    );
  },
};
