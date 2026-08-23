import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

type EmptyStateProps = {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
};

/** 목록이 비었을 때. 빈 테이블만 남겨두지 않는다. */
export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'border-divider flex flex-col items-center justify-center gap-2 border border-dashed px-6 py-14 text-center',
        className,
      )}
    >
      <p className="font-heading text-[17px]">{title}</p>
      {description && <p className="text-muted text-[12.5px]">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
