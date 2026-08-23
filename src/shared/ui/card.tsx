import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

/**
 * 목업의 기본 면 — 흐린 배경 + hairline 테두리.
 *
 * 상세 화면의 정보 블록, 목록 테이블 감싸개, 폼 섹션이 모두 이걸 쓴다.
 */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('border-divider border bg-neutral-100', className)} {...props} />;
}

/**
 * 카드 안의 섹션 제목. 목업 전반에 반복되는 대문자 케이스레이블이다.
 */
export function CardKicker({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'font-heading text-accent-700 text-[11px] tracking-[0.14em] uppercase',
        className,
      )}
    >
      {children}
    </div>
  );
}

/** 안내용 패널 — 액센트 톤 배경. 등록 화면 오른쪽 설명 박스에 쓴다. */
export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('border-divider bg-accent-100 text-accent-900 border p-5', className)}
      {...props}
    />
  );
}
