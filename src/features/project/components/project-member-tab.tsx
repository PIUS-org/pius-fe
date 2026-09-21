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
  /** 수정 대상. null 이면 창이 닫힌 상태다. */
  const [editing, setEditing] = useState<ProjectDetail['members'][number] | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  /** 제거 확인 대상. null 이면 창이 닫힌 상태다. */
  const [removing, setRemoving] = useState<{ memberId: number; name: string } | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

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

  async function confirmRemove() {
    if (!removing) return;
    setRemoveError(null);
    try {
      await members.remove.mutateAsync(removing.memberId);
      setRemoving(null);
      showToast(`${removing.name} 님을 참여인력에서 제거했습니다.`);
    } catch (error) {
      setRemoveError(isApiError(error) ? error.message : '제거에 실패했습니다.');
    }
  }

  async function saveMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const form = new FormData(event.currentTarget);
    const role = String(form.get('role') ?? '').trim();
    // 정직원은 프로젝트별 용역비를 입력하지 않는다. 용역이어도 가려진 값이면
    // 읽지도 못한 금액을 덮어쓰게 되므로 손대지 않는다.
    const feeEditable = editing.employmentType === 'CONTRACTOR' && !editing.outsourcingFeeMasked;

    setEditError(null);
    try {
      await members.update.mutateAsync({
        memberId: editing.memberId,
        role,
        ...(feeEditable ? { outsourcingFee: parseMoney(String(form.get('fee') ?? '')) } : {}),
      });
      setEditing(null);
      showToast(`${editing.name} 님의 정보를 저장했습니다.`);
    } catch (error) {
      setEditError(isApiError(error) ? error.message : '저장에 실패했습니다.');
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
                {/* 수정은 다이얼로그 한 곳에서만 한다. 인라인 입력과 병행하면 경로가
                    갈리고, 저장 실패 시 입력값이 남는 문제도 있었다. */}
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
              </div>

              <div className="flex items-center gap-1.5">
                <Tag tone={employmentStatusTone(member.employmentStatus)}>
                  {member.employmentStatusLabel}
                </Tag>
                {canManage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`${member.name} 수정`}
                    onClick={() => {
                      setEditError(null);
                      setEditing(member);
                    }}
                  >
                    수정
                  </Button>
                )}
                {canManage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`${member.name} 제거`}
                    onClick={() => {
                      setRemoveError(null);
                      setRemoving({ memberId: member.memberId, name: member.name });
                    }}
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

      <Dialog
        open={removing !== null}
        onOpenChange={(next) => {
          if (!next) setRemoving(null);
        }}
        title="참여인력 제거"
        description={
          removing
            ? `${removing.name} 님을 이 프로젝트의 참여인력에서 제거합니다. 되돌릴 수 없습니다.`
            : undefined
        }
        actions={
          <>
            <Button variant="secondary" onClick={() => setRemoving(null)}>
              취소
            </Button>
            <Button variant="danger" onClick={confirmRemove} disabled={members.remove.isPending}>
              제거
            </Button>
          </>
        }
      >
        {removeError && (
          <p role="alert" className="text-danger mt-3 text-[12.5px]">
            {removeError}
          </p>
        )}
      </Dialog>

      <Dialog
        open={editing !== null}
        onOpenChange={(next) => {
          if (!next) setEditing(null);
        }}
        title="참여인력 수정"
        description={editing ? `${editing.name} 님의 역할과 용역비를 바꿉니다.` : undefined}
        width={440}
      >
        {editing && (
          // key 를 주어 다른 인력을 열면 입력값이 새로 잡히게 한다.
          <form key={editing.memberId} onSubmit={saveMember}>
            <Field label="역할" required>
              {({ id }) => (
                <Input id={id} name="role" defaultValue={editing.role} required autoFocus />
              )}
            </Field>

            {editing.employmentType === 'CONTRACTOR' ? (
              <div className="mt-3">
                <Field
                  label="용역비"
                  hint={editing.outsourcingFeeMasked ? '본인 것만 수정할 수 있습니다.' : undefined}
                >
                  {({ id }) => (
                    <Input
                      id={id}
                      name="fee"
                      className="tabular text-right"
                      readOnly={editing.outsourcingFeeMasked}
                      // 0 원도 값이다. falsy 로 판정하면 빈칸으로 그려진다.
                      defaultValue={
                        editing.outsourcingFee === null
                          ? ''
                          : formatMoneyInput(String(editing.outsourcingFee))
                      }
                      onBlur={(event) => {
                        event.currentTarget.value = formatMoneyInput(event.currentTarget.value);
                      }}
                    />
                  )}
                </Field>
              </div>
            ) : (
              <p className="text-muted mt-3 text-[12.5px]">
                정직원은 프로젝트별 용역비를 입력하지 않습니다.
              </p>
            )}

            {editError && (
              <p role="alert" className="text-danger mt-3 text-[12.5px]">
                {editError}
              </p>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditing(null)}>
                취소
              </Button>
              <Button type="submit" variant="primary" disabled={members.update.isPending}>
                저장
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </Card>
  );
}
