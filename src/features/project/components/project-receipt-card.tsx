'use client';

import { useState } from 'react';
import type { ProjectDetail, ProjectReceipt, ReceiptKind } from '@/entities/project/types';
import { isApiError } from '@/shared/api/error';
import { formatMoney, formatMoneyInput, parseMoney } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';
import { Card, CardKicker } from '@/shared/ui/card';
import { Dialog } from '@/shared/ui/dialog';
import { Field } from '@/shared/ui/field';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { useToast } from '@/shared/ui/toast';
import { useProjectReceipts } from '../hooks/use-projects';

const KINDS: { value: ReceiptKind; label: string }[] = [
  { value: 'ADVANCE', label: '선금' },
  { value: 'INTERIM', label: '중도금' },
  { value: 'BALANCE', label: '잔금' },
  { value: 'ETC', label: '기타' },
];

const today = () => new Date().toISOString().slice(0, 10);

/**
 * 수금 내역.
 *
 * <p>프로젝트 수령액은 이 목록의 합계다 — 서버에도 저장된 컬럼이 없다.
 * 그래서 여기서 한 건을 더하거나 지우면 수령액·미수금이 즉시 따라 움직인다.
 */
export function ProjectReceiptCard({ project }: { project: ProjectDetail }) {
  const { showToast } = useToast();
  const receipts = useProjectReceipts(project.projectId);

  /** null 이면 창이 닫힌 상태. 'new' 는 신규 등록. */
  const [editing, setEditing] = useState<ProjectReceipt | 'new' | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<ProjectReceipt | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const rows = receipts.list.data ?? [];
  const total = rows.reduce((sum, row) => sum + row.amount, 0);
  // 계약금액을 넘는 수금은 막지 않는다. 대신 눈에 띄게 알린다.
  const overpaid = project.contractAmount !== null && total > project.contractAmount;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const form = new FormData(event.currentTarget);
    const body = {
      receivedOn: String(form.get('receivedOn') ?? ''),
      amount: parseMoney(String(form.get('amount') ?? '')),
      kind: String(form.get('kind') ?? 'ETC') as ReceiptKind,
      memo: String(form.get('memo') ?? '').trim() || null,
    };

    setFormError(null);
    try {
      if (editing === 'new') {
        await receipts.add.mutateAsync(body);
        showToast('수금을 등록했습니다.');
      } else {
        await receipts.update.mutateAsync({ receiptId: editing.receiptId, body });
        showToast('수금을 수정했습니다.');
      }
      setEditing(null);
    } catch (error) {
      setFormError(isApiError(error) ? error.message : '저장에 실패했습니다.');
    }
  }

  async function confirmRemove() {
    if (!removing) return;
    setRemoveError(null);
    try {
      await receipts.remove.mutateAsync(removing.receiptId);
      setRemoving(null);
      showToast('수금을 삭제했습니다.');
    } catch (error) {
      setRemoveError(isApiError(error) ? error.message : '삭제에 실패했습니다.');
    }
  }

  const target = editing === 'new' || editing === null ? null : editing;

  return (
    <Card className="px-5.5 py-5">
      <div className="mb-2.5 flex items-center justify-between">
        <CardKicker>수금 내역</CardKicker>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setFormError(null);
            setEditing('new');
          }}
        >
          수금 등록
        </Button>
      </div>

      {receipts.list.isPending ? (
        <p className="text-muted py-3 text-[13px]">불러오는 중…</p>
      ) : rows.length === 0 ? (
        <p className="text-muted py-2 text-[12.5px]">등록된 수금이 없습니다.</p>
      ) : (
        rows.map((receipt) => (
          <div
            key={receipt.receiptId}
            className="border-divider flex items-start gap-2 border-t py-2.5"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="tabular text-sm font-medium">{formatMoney(receipt.amount)}</span>
                <span className="text-muted text-[11.5px]">{receipt.kindLabel}</span>
              </div>
              <div className="text-muted-strong tabular mt-0.5 text-[12.5px]">
                {receipt.receivedOn}
                {receipt.memo && <span className="ml-1.5">· {receipt.memo}</span>}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              aria-label={`${receipt.receivedOn} 수금 수정`}
              onClick={() => {
                setFormError(null);
                setEditing(receipt);
              }}
            >
              수정
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label={`${receipt.receivedOn} 수금 삭제`}
              onClick={() => {
                setRemoveError(null);
                setRemoving(receipt);
              }}
            >
              삭제
            </Button>
          </div>
        ))
      )}

      <div className="border-divider mt-3 flex items-center justify-between border-t pt-3">
        <span className="text-muted text-[12.5px]">합계</span>
        <span
          className={
            overpaid ? 'text-danger tabular text-sm font-medium' : 'tabular text-sm font-medium'
          }
        >
          {formatMoney(total)}
        </span>
      </div>
      {overpaid && (
        <p className="text-danger mt-1.5 text-[11.5px]">계약금액보다 많이 수금되었습니다.</p>
      )}

      <Dialog
        open={editing !== null}
        onOpenChange={(next) => {
          if (!next) setEditing(null);
        }}
        title={editing === 'new' ? '수금 등록' : '수금 수정'}
        width={460}
      >
        {editing !== null && (
          <form key={target?.receiptId ?? 'new'} onSubmit={submit}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="입금일" required>
                {({ id }) => (
                  <Input
                    id={id}
                    name="receivedOn"
                    type="date"
                    required
                    defaultValue={target?.receivedOn ?? today()}
                  />
                )}
              </Field>
              <Field label="구분">
                {({ id }) => (
                  <Select id={id} name="kind" defaultValue={target?.kind ?? 'ETC'}>
                    {KINDS.map((kind) => (
                      <option key={kind.value} value={kind.value}>
                        {kind.label}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
            </div>
            <div className="mt-3">
              <Field label="금액" required>
                {({ id }) => (
                  <Input
                    id={id}
                    name="amount"
                    className="tabular text-right"
                    required
                    defaultValue={target ? formatMoneyInput(String(target.amount)) : ''}
                    onBlur={(event) => {
                      event.currentTarget.value = formatMoneyInput(event.currentTarget.value);
                    }}
                  />
                )}
              </Field>
            </div>
            <div className="mt-3">
              <Field label="메모">
                {({ id }) => (
                  <Input
                    id={id}
                    name="memo"
                    defaultValue={target?.memo ?? ''}
                    placeholder="세금계산서 발행"
                  />
                )}
              </Field>
            </div>

            {formError && (
              <p role="alert" className="text-danger mt-3 text-[12.5px]">
                {formError}
              </p>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setEditing(null)}>
                취소
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={receipts.add.isPending || receipts.update.isPending}
              >
                저장
              </Button>
            </div>
          </form>
        )}
      </Dialog>

      <Dialog
        open={removing !== null}
        onOpenChange={(next) => {
          if (!next) setRemoving(null);
        }}
        title="수금 삭제"
        description={
          removing
            ? `${removing.receivedOn} · ${formatMoney(removing.amount)} 수금을 삭제합니다. 수령액이 함께 줄어듭니다.`
            : undefined
        }
        actions={
          <>
            <Button variant="secondary" onClick={() => setRemoving(null)}>
              취소
            </Button>
            <Button variant="danger" onClick={confirmRemove} disabled={receipts.remove.isPending}>
              삭제
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
    </Card>
  );
}
