'use client';

import { useState } from 'react';
import { canReadRrn } from '@/entities/account/role';
import {
  employmentStatusTone,
  hiredAtLabel,
  isContractorType,
  leaveAtLabel,
} from '@/entities/person/status';
import type { PersonDetail, PersonUpdateRequest } from '@/entities/person/types';
import { projectStatusTone } from '@/entities/project/status';
import { useAttachments } from '@/features/attachment/use-attachments';
import { useAccount } from '@/features/auth/auth-provider';
import { isApiError } from '@/shared/api/error';
import { formatPhone } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';
import { Card, CardKicker } from '@/shared/ui/card';
import { DetailRow } from '@/shared/ui/detail-row';
import { Dialog } from '@/shared/ui/dialog';
import { FileUpload } from '@/shared/ui/file-upload';
import { Input } from '@/shared/ui/input';
import { RadioGroup } from '@/shared/ui/radio';
import { Tag } from '@/shared/ui/tag';
import { useToast } from '@/shared/ui/toast';
import { personApi, personKeys } from '../api/person.api';
import { usePersonProjects, useUpdatePerson } from '../hooks/use-persons';

/** 편집 가능한 값만 모은 초안. 저장 전까지 서버 데이터를 건드리지 않는다. */
type Draft = {
  phone: string;
  email: string;
  jobTitle: string;
  leaveAt: string;
  active: boolean;
};

function draftOf(person: PersonDetail): Draft {
  return {
    phone: person.phone,
    email: person.email ?? '',
    jobTitle: person.jobTitle ?? '',
    leaveAt: person.leaveAt ?? '',
    active: person.employmentStatus === 'ACTIVE',
  };
}

export function PersonInfoTab({ person }: { person: PersonDetail }) {
  const { showToast } = useToast();

  // 주민등록번호 원본. 마스터가 "보기" 를 눌렀을 때만 서버에서 한 번 가져온다.
  const account = useAccount();
  const [rrn, setRrn] = useState<string | null>(null);
  const [rrnError, setRrnError] = useState<string | null>(null);
  const [rrnLoading, setRrnLoading] = useState(false);

  async function toggleRrn() {
    if (rrn) {
      setRrn(null);
      return;
    }
    setRrnError(null);
    setRrnLoading(true);
    try {
      setRrn((await personApi.rrn(person.personId)).rrn);
    } catch (error) {
      setRrnError(isApiError(error) ? error.message : '주민등록번호를 불러오지 못했습니다.');
    } finally {
      setRrnLoading(false);
    }
  }
  const update = useUpdatePerson(person.personId);
  const attachments = useAttachments(
    'PERSON_CONTRACT',
    person.personId,
    personKeys.detail(person.personId),
  );

  // 서버 데이터가 갱신되면 key 로 이 컴포넌트가 새로 마운트되어 초안도 초기화된다.
  const [draft, setDraft] = useState<Draft>(() => draftOf(person));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const original = draftOf(person);
  const dirty = (Object.keys(original) as (keyof Draft)[]).some(
    (key) => draft[key] !== original[key],
  );
  const contractor = isContractorType(person.employmentType);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  // 퇴사일을 "새로" 지정한 경우에만 경고한다. 이미 있던 날짜를 고치는 건 해당 없다.
  const settingLeaveDate = !original.leaveAt && Boolean(draft.leaveAt);
  const [handoverOpen, setHandoverOpen] = useState(false);
  // 창이 열릴 때만 부른다. 정보 탭을 보는 내내 프로젝트 목록을 들고 있을 이유가 없다.
  const affected = usePersonProjects(person.personId, handoverOpen);

  /**
   * 인수인계가 필요한 프로젝트.
   *
   * 용역은 진행중인 참여 건만 본다 — 완료된 건은 넘길 채널이 없다.
   * 정직원은 담당자로 지정된 프로젝트를 <b>완료된 것까지</b> 함께 본다.
   * 담당자 누락은 인력 공백을 넘어 거래처 채널 누락이기 때문이다.
   */
  const handoverTargets = (affected.data ?? []).filter((project) =>
    contractor
      ? project.status === 'IN_PROGRESS'
      : project.status === 'IN_PROGRESS' || project.owned,
  );

  function requestSave() {
    if (settingLeaveDate) {
      setHandoverOpen(true);
      return;
    }
    void save();
  }

  async function confirmHandover() {
    setHandoverOpen(false);
    await save();
  }

  async function save() {
    const body: PersonUpdateRequest = {};
    if (draft.phone !== original.phone) body.phone = draft.phone;
    if (draft.email !== original.email) body.email = draft.email;
    if (draft.jobTitle !== original.jobTitle) body.jobTitle = draft.jobTitle;

    if (draft.leaveAt !== original.leaveAt) {
      // 값을 지운 것과 새 날짜를 넣은 것은 다른 요청이다.
      if (draft.leaveAt) body.leaveAt = draft.leaveAt;
      else body.clearLeaveAt = true;
    }
    // 재직상태는 용역만 직접 바꾼다. 정직원은 퇴사일에서 파생된다.
    if (contractor && draft.active !== original.active) body.active = draft.active;

    setFieldErrors({});
    try {
      await update.mutateAsync(body);
      showToast('변경사항을 저장했습니다.');
    } catch (error) {
      if (isApiError(error)) {
        setFieldErrors(error.fields ?? {});
        if (!error.fields) showToast(error.message);
      } else {
        showToast('일시적인 오류가 발생했습니다.');
      }
    }
  }

  return (
    <div className="max-w-[1000px]">
      <div className="grid grid-cols-2 gap-5">
        <Card className="px-5.5 py-5">
          <CardKicker className="mb-1.5">사람 정보</CardKicker>
          <DetailRow label="이름">{person.name}</DetailRow>
          <DetailRow label="주민번호">
            <span className="flex items-center gap-2">
              <span className="tabular">{rrn ?? person.rrnMasked}</span>
              {canReadRrn(account.role) && (
                <Button variant="ghost" size="sm" onClick={toggleRrn} disabled={rrnLoading}>
                  {rrn ? '가리기' : rrnLoading ? '불러오는 중…' : '보기'}
                </Button>
              )}
            </span>
            {rrnError && (
              <span role="alert" className="text-danger mt-1 block text-[12.5px]">
                {rrnError}
              </span>
            )}
          </DetailRow>
          <DetailRow label="전화번호">
            <Input
              aria-label="전화번호"
              value={draft.phone}
              invalid={Boolean(fieldErrors.phone)}
              onChange={(e) => set('phone', e.target.value)}
              onBlur={() => set('phone', formatPhone(draft.phone))}
            />
          </DetailRow>
          <DetailRow label="이메일">
            <Input
              aria-label="이메일"
              type="email"
              value={draft.email}
              invalid={Boolean(fieldErrors.email)}
              onChange={(e) => set('email', e.target.value)}
            />
          </DetailRow>
        </Card>

        <Card className="px-5.5 py-5">
          <CardKicker className="mb-1.5">근태 정보</CardKicker>
          <DetailRow label={hiredAtLabel(person.employmentType)}>
            <span className="tabular">{person.hiredAt}</span>
          </DetailRow>
          <DetailRow label="계약형태">{person.employmentTypeLabel}</DetailRow>
          <DetailRow label="직무">
            <Input
              aria-label="직무"
              value={draft.jobTitle}
              placeholder="예: 백엔드 개발"
              onChange={(e) => set('jobTitle', e.target.value)}
            />
          </DetailRow>
          <DetailRow label="재직상태">
            <Tag tone={employmentStatusTone(person.employmentStatus)}>
              {person.employmentStatusLabel}
            </Tag>
          </DetailRow>

          <DetailRow label={leaveAtLabel(person.employmentType)}>
            <Input
              aria-label={leaveAtLabel(person.employmentType)}
              type="date"
              min={person.hiredAt}
              value={draft.leaveAt}
              invalid={Boolean(fieldErrors.leaveAt)}
              onChange={(e) => set('leaveAt', e.target.value)}
            />
            <p className="text-muted mt-1.5 text-[11.5px]">
              {contractor
                ? '비활성화 시 재직상태는 퇴사로 처리됩니다.'
                : `${hiredAtLabel(person.employmentType)}(${person.hiredAt}) 이전 날짜는 선택할 수 없습니다. 해당 일자가 지나면 퇴사 처리됩니다.`}
            </p>
            {fieldErrors.leaveAt && (
              <p role="alert" className="text-danger mt-1 text-[11.5px]">
                {fieldErrors.leaveAt}
              </p>
            )}
          </DetailRow>

          {contractor && (
            <DetailRow label="비활성화">
              <RadioGroup
                name="active"
                value={draft.active ? 'active' : 'inactive'}
                onChange={(value) => set('active', value === 'active')}
                options={[
                  { value: 'active', label: '활성' },
                  { value: 'inactive', label: '비활성화' },
                ]}
              />
            </DetailRow>
          )}

          <p className="text-muted mt-3.5 text-[11.5px] leading-relaxed">
            주민등록번호는 마스킹되어 표시됩니다. 원본은 마스터 계정만 볼 수 있고, 조회 기록이
            남습니다.
          </p>
        </Card>
      </div>

      <div className="mt-4.5 flex items-center gap-3">
        <Button variant="primary" disabled={!dirty || update.isPending} onClick={requestSave}>
          {update.isPending ? '저장 중…' : '변경사항 저장'}
        </Button>
        <Button variant="secondary" disabled={!dirty} onClick={() => setDraft(draftOf(person))}>
          되돌리기
        </Button>
        <span className={dirty ? 'text-accent-700 text-[11.5px]' : 'text-muted text-[11.5px]'}>
          {dirty ? '저장하지 않은 변경사항이 있습니다' : '변경사항 없음'}
        </span>
      </div>

      <Card className="mt-5 max-w-[620px] px-5.5 py-5">
        <CardKicker className="mb-3">계약서</CardKicker>
        <FileUpload
          files={person.attachments}
          onSelect={attachments.onSelect}
          onOpen={attachments.onOpen}
          onDelete={attachments.onDelete}
        />
      </Card>

      <Dialog
        open={handoverOpen}
        onOpenChange={setHandoverOpen}
        title="인수인계가 필요합니다"
        description={
          contractor
            ? `${person.name} 님이 진행중인 프로젝트에 참여하고 있습니다.`
            : `${person.name} 님이 담당하거나 진행중인 프로젝트가 있습니다.`
        }
        width={520}
        actions={
          <>
            <Button variant="secondary" onClick={() => setHandoverOpen(false)}>
              취소
            </Button>
            <Button variant="primary" onClick={confirmHandover} disabled={update.isPending}>
              확인하고 저장
            </Button>
          </>
        }
      >
        {affected.isPending ? (
          <p className="text-muted py-3 text-[13px]">불러오는 중…</p>
        ) : handoverTargets.length === 0 ? (
          <p className="text-muted py-3 text-[13px]">인수인계가 필요한 프로젝트가 없습니다.</p>
        ) : (
          <>
            <ul className="border-divider mt-1 border-t">
              {handoverTargets.map((project) => (
                <li key={project.projectId} className="border-divider border-b py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{project.name}</span>
                    <Tag tone={projectStatusTone(project.status)}>{project.statusLabel}</Tag>
                    {project.owned && (
                      <span className="text-danger text-[11.5px] font-medium">담당자</span>
                    )}
                  </div>
                  <div className="text-muted-strong mt-0.5 text-[12.5px]">
                    {project.clientName} · {project.role}
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-muted mt-3 text-[11.5px] leading-relaxed">
              {contractor
                ? '진행중인 프로젝트만 표시됩니다. 참여인력에서 자동으로 빠지지 않으니 필요하면 직접 교체해주세요.'
                : '담당자로 지정된 프로젝트는 완료된 건까지 표시됩니다. 담당자가 비면 거래처 연락 채널이 끊기므로 반드시 인수인계해주세요.'}
            </p>
          </>
        )}
      </Dialog>
    </div>
  );
}
