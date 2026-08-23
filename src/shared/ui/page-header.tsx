import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

type PageHeaderProps = {
  /** 케이스레이블. 예: "인사관리" */
  kicker?: string;
  title: string;
  description?: ReactNode;
  /** 우측 액션 버튼 자리 */
  actions?: ReactNode;
  className?: string;
};

/** 목록 · 등록 화면 상단의 제목 영역. */
export function PageHeader({ kicker, title, description, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-5 flex items-end justify-between gap-4', className)}>
      <div>
        {kicker && (
          <div className="font-heading text-accent-700 text-[11px] tracking-[0.16em] uppercase">
            {kicker}
          </div>
        )}
        <h2 className="font-heading mt-0.5 text-[30px] leading-tight">{title}</h2>
        {description && <p className="text-muted mt-1.5 text-[12.5px]">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-2.5">{actions}</div>}
    </div>
  );
}
