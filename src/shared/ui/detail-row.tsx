import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

type DetailRowProps = {
  label: string;
  children: ReactNode;
  /** 라벨 열 너비. 카드마다 조금씩 다르다. */
  labelWidth?: number;
  className?: string;
};

/**
 * 상세 화면의 `라벨 : 값` 한 줄.
 *
 * 위쪽 테두리로 행을 나눈다 — 목업이 테이블 대신 이 방식을 쓴다.
 */
export function DetailRow({ label, children, labelWidth = 114, className }: DetailRowProps) {
  return (
    <div
      className={cn('border-divider grid items-center gap-3 border-t py-3 text-sm', className)}
      style={{ gridTemplateColumns: `${labelWidth}px 1fr` }}
    >
      <div className="text-muted text-[12.5px]">{label}</div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
