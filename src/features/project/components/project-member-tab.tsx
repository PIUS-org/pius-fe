'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { canManageInternalData, canManageProject } from '@/entities/account/role';
import { employmentStatusTone } from '@/entities/person/status';
import { displayFee } from '@/entities/project/status';
import type { ProjectDetail } from '@/entities/project/types';
import { useAccount } from '@/features/auth/auth-provider';
import { useAccessDenied } from '@/features/layout/access-denied';
import { isApiError } from '@/shared/api/error';
import { formatMoneyInput, parseMoney } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';
import { Card, CardKicker } from '@/shared/ui/card';
import { Dialog } from '@/shared/ui/dialog';
import { Field } from '@/shared/ui/field';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { Tag } from '@/shared/ui/tag';
import { useToast } from '@/shared/ui/toast';
import { usePersonOptions, useProjectMembers } from '../hooks/use-projects';

const GRID = 'grid grid-cols-[1.1fr_0.7fr_1.2fr_1.2fr_0.8fr] items-center gap-2.5';

export function ProjectMemberTab({ project }: { project: ProjectDetail }) {
  const router = useRouter();
  const account = useAccount();
  const { showToast } = useToast();
  const { showAccessDenied } = useAccessDenied();
  const members = useProjectMembers(project.projectId);

  const [addOpen, setAddOpen] = useState(false);
  const [pickedPersonId, setPickedPersonId] = useState('');
  const [fee, setFee] = useState('');
  const [addError, setAddError] = useState<string | null>(null);

  const persons = usePersonOptions(addOpen);
  const canManage = canManageProject(account.role);
  const canOpenPerson = canManageInternalData(account.role);

  const alreadyIn = new Set(project.members.map((member) => member.personId));
  const candidates = (persons.data?.content ?? []).filter((p) => !alreadyIn.has(p.personId));
  const picked = candidates.find((p) => String(p.personId) === pickedPersonId);
  // 용역비는 용역 인력에게만 입력한다.
  const feeAllowed = picked?.employmentType === 'CONTRACTOR';

  async function addMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!picked) return;
    setAddError(null);

    const form = new FormData(event.currentTarget);
    try {
      await members.add.mutateAsync({
        personId: picked.personId,
        role: String(form.get('role') ?? '').trim(),
        outsourcingFee: feeAllowed ? parseMoney(fee) : null,
      });
      setAddOpen(false);
      setPickedPersonId('');
      setFee('');
      showToast('참여인력을 추가했습니다.');
    } catch (error) {
      setAddError(isApiError(error) ? error.message : '추가에 실패했습니다.');
    }
  }

  async function saveFee(memberId: number, value: string) {
    try {
      await members.update.mutateAsync({ memberId, outsourcingFee: parseMoney(value) });
      showToast('용역비를 저장했습니다.');
    } catch (error) {
      showToast(isApiError(error) ? error.message : '저장에 실패했습니다.');
    }
  }

  return (
    <Card className="max-w-[920px] px-5.5 py-5">
      <div className="mb-3 flex items-center justify-between">
        <CardKicker>참여인력</CardKicker>
        {canManage && (
          <Button variant="ghost" size="sm" onClick={() => setAddOpen(true)}>
            인력 추가
          </Button>
        )}
      </div>

      <div
        className={`${GRID} text-muted border-divider border-b pb-2 text-[11px] tracking-[0.08em] uppercase`}
      >
        <div>참여인력</div>
        <div>구분</div>
        <div>역할</div>
        <div>용역비</div>
        <div>상태</div>
      </div>

      {project.members.length === 0 ? (
        <p className="text-muted py-6 text-center text-[13px]">참여인력이 없습니다.</p>
      ) : (
        project.members.map((member) => {
          const editableFee = canManage && member.employmentType === 'CONTRACTOR';
          return (
            <div key={member.memberId} className={`${GRID} border-text/8 border-b py-2.5 text-sm`}>
              <div>
                {canOpenPerson ? (
                  <button
                    type="button"
                    onClick={() => router.push(`/hr/${member.personId}`)}
                    className="text-accent-700 cursor-pointer underline underline-offset-[3px]"
                  >
                    {member.name}
                  </button>
                ) : (
                  /* 용역은 인사 상세를 열 수 없다. 이유를 알려준다. */
                  <button
                    type="button"
                    aria-disabled
                    onClick={showAccessDenied}
                    className="cursor-not-allowed text-left"
                  >
                    {member.name}
                  </button>
                )}
              </div>

              <div>{member.employmentTypeLabel}</div>
              <div>{member.role}</div>

              <div>
                {editableFee ? (
                  <Input
                    aria-label={`${member.name} 용역비`}
                    className="tabular min-h-[30px] text-right text-[13px]"
                    defaultValue={
                      member.outsourcingFee ? formatMoneyInput(String(member.outsourcingFee)) : ''
                    }
                    onBlur={(event) => {
                      const next = parseMoney(event.target.value);
                      if (next !== member.outsourcingFee)
                        void saveFee(member.memberId, event.target.value);
                      event.target.value = next ? formatMoneyInput(String(next)) : '';
                    }}
                  />
                ) : (
                  <span
                    className={
                      member.employmentType === 'EMPLOYEE' ? 'text-muted-weak tabular' : 'tabular'
                    }
                  >
                    {displayFee(
                      member.outsourcingFee,
                      member.outsourcingFeeMasked,
                      member.employmentType,
                    )}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <Tag tone={employmentStatusTone(member.employmentStatus)}>
                  {member.employmentStatusLabel}
                </Tag>
                {canManage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`${member.name} 제거`}
                    onClick={() => members.remove.mutate(member.memberId)}
                  >
                    제거
                  </Button>
                )}
              </div>
            </div>
          );
        })
      )}

      <p className="text-muted mt-3.5 text-[11.5px] leading-relaxed">
        {canManage
          ? '용역비는 용역 인력만 입력합니다. 정직원은 프로젝트별 금액을 입력하지 않습니다. 참여인력이 퇴사하거나 참여가 종료되어도 목록에서 삭제하지 않고 현재 상태를 함께 표시합니다.'
          : '본인의 용역비만 확인할 수 있습니다.'}
      </p>

      <Dialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title="참여인력 추가"
        description="등록된 인력 중에서 선택합니다. 용역 인력을 선택하면 용역비를 입력할 수 있습니다."
        width={460}
      >
        <form onSubmit={addMember}>
          <div className="flex flex-col gap-3">
            <Field label="참여인력" required>
              {({ id }) => (
                <Select
                  id={id}
                  required
                  value={pickedPersonId}
                  onChange={(event) => setPickedPersonId(event.target.value)}
                >
                  <option value="">인력을 선택하세요</option>
                  {candidates.map((person) => (
                    <option key={person.personId} value={person.personId}>
                      {person.name} ({person.employmentTypeLabel}
                      {person.employmentStatus === 'RESIGNED' ? ' · 퇴사' : ''})
                    </option>
                  ))}
                </Select>
              )}
            </Field>

            <Field label="역할" required>
              {({ id }) => <Input id={id} name="role" required placeholder="예: 백엔드 개발" />}
            </Field>

            <Field
              label="용역비"
              hint={feeAllowed ? '용역 인력만 입력' : '정직원은 입력하지 않습니다'}
            >
              {({ id }) => (
                <Input
                  id={id}
                  className="tabular text-right"
                  placeholder="0"
                  disabled={!feeAllowed}
                  value={feeAllowed ? fee : ''}
                  onChange={(event) => setFee(event.target.value)}
                  onBlur={() => setFee(formatMoneyInput(fee))}
                />
              )}
            </Field>
          </div>

          {addError && (
            <p role="alert" className="text-danger mt-3 text-[12.5px]">
              {addError}
            </p>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setAddOpen(false)}>
              취소
            </Button>
            <Button type="submit" variant="primary" disabled={members.add.isPending || !picked}>
              추가
            </Button>
          </div>
        </form>
      </Dialog>
    </Card>
  );
}
