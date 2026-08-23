'use client';

import { useState } from 'react';
import { canManageProject } from '@/entities/account/role';
import { displayAmount } from '@/entities/project/status';
import type { ProjectDetail } from '@/entities/project/types';
import { useAccount } from '@/features/auth/auth-provider';
import { isApiError } from '@/shared/api/error';
import { formatDateRange, formatMoneyInput, parseMoney } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';
import { Card, CardKicker } from '@/shared/ui/card';
import { DetailRow } from '@/shared/ui/detail-row';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { useToast } from '@/shared/ui/toast';
import { useUpdateProject } from '../hooks/use-projects';

export function ProjectBasicTab({ project }: { project: ProjectDetail }) {
  const account = useAccount();
  const { showToast } = useToast();
  const update = useUpdateProject(project.projectId);
  const canManage = canManageProject(account.role);

  const [amount, setAmount] = useState(
    project.contractAmount === null ? '' : formatMoneyInput(String(project.contractAmount)),
  );
  const [description, setDescription] = useState(project.description ?? '');

  const descriptionDirty = description !== (project.description ?? '');

  async function save(body: Parameters<typeof update.mutateAsync>[0], message: string) {
    try {
      await update.mutateAsync(body);
      showToast(message);
    } catch (error) {
      showToast(isApiError(error) ? error.message : '저장에 실패했습니다.');
    }
  }

  return (
    <div className="grid [grid-template-columns:420px_minmax(0,1fr)] items-start gap-5">
      <Card className="px-5.5 py-5">
        <CardKicker className="mb-1.5">기본정보</CardKicker>
        <DetailRow label="프로젝트명" labelWidth={100}>
          {project.name}
        </DetailRow>
        <DetailRow label="거래처" labelWidth={100}>
          {project.client.name}
        </DetailRow>
        <DetailRow label="계약기간" labelWidth={100}>
          <span className={project.overdue ? 'text-danger tabular' : 'tabular'}>
            {formatDateRange(project.contractStartDate, project.contractEndDate)}
          </span>
        </DetailRow>
        <DetailRow label="실제 종료일" labelWidth={100}>
          <span className="tabular">{project.actualEndDate ?? '-'}</span>
        </DetailRow>
        <DetailRow label="진행상태" labelWidth={100}>
          {project.statusLabel}
        </DetailRow>
        <DetailRow label="담당자" labelWidth={100}>
          {project.owner?.name ?? '-'}
        </DetailRow>

        <DetailRow label="계약금액" labelWidth={100}>
          {canManage ? (
            <Input
              aria-label="계약금액"
              className="tabular text-right"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              onBlur={() => setAmount(formatMoneyInput(amount))}
            />
          ) : (
            /* 용역에게는 값이 오지 않는다. 서버가 이미 가려서 내려준다. */
            <span className="tabular">
              {displayAmount(project.contractAmount, project.contractAmountMasked)}
            </span>
          )}
        </DetailRow>

        {canManage && (
          <>
            <DetailRow label="수령액" labelWidth={100}>
              <span className="tabular">
                {displayAmount(project.receivedAmount, project.receivedAmountMasked)}
              </span>
            </DetailRow>
            <div className="mt-3.5 flex items-center gap-3">
              <Button
                variant="primary"
                disabled={update.isPending}
                onClick={() =>
                  save({ contractAmount: parseMoney(amount) }, '계약금액을 저장했습니다.')
                }
              >
                계약금액 저장
              </Button>
              <span className="text-muted text-[11.5px]">
                숫자 입력 후 저장하면 세 자리 콤마가 적용됩니다.
              </span>
            </div>
          </>
        )}
      </Card>

      <Card className="px-5.5 py-5">
        <CardKicker className="mb-2.5">프로젝트 상세내용</CardKicker>
        <Textarea
          aria-label="프로젝트 상세내용"
          className="min-h-[200px]"
          readOnly={!canManage}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        {canManage && (
          <div className="mt-3">
            <Button
              variant="primary"
              disabled={!descriptionDirty || update.isPending}
              onClick={() => save({ description }, '내용을 저장했습니다.')}
            >
              내용 저장
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
