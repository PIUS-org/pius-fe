'use client';

import { cn } from '@/shared/lib/cn';
import { Button } from './button';

type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  /** 하단 안내 문구. 예: "한 화면 12명" */
  note?: string;
  className?: string;
};

/** 한 번에 보여줄 페이지 번호 개수. 양옆으로 2칸씩. */
const WINDOW = 2;

function pageNumbers(page: number, totalPages: number): number[] {
  const start = Math.max(1, Math.min(page - WINDOW, totalPages - WINDOW * 2));
  const end = Math.min(totalPages, Math.max(page + WINDOW, WINDOW * 2 + 1));
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function Pagination({ page, totalPages, onChange, note, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="페이지"
      className={cn('mt-5 flex items-center justify-center gap-1.5', className)}
    >
      <Button
        variant="secondary"
        aria-label="이전 페이지"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="min-w-[34px] px-2.5 py-1.5"
      >
        ‹
      </Button>

      {pageNumbers(page, totalPages).map((n) => (
        <Button
          key={n}
          aria-label={`${n} 페이지`}
          aria-current={n === page ? 'page' : undefined}
          onClick={() => onChange(n)}
          className={cn(
            'min-w-[34px] px-2.5 py-1.5',
            n === page ? 'border-accent bg-accent text-bg' : 'border-divider',
          )}
        >
          {n}
        </Button>
      ))}

      <Button
        variant="secondary"
        aria-label="다음 페이지"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="min-w-[34px] px-2.5 py-1.5"
      >
        ›
      </Button>

      {note && <span className="text-muted ml-2.5 text-xs">{note}</span>}
    </nav>
  );
}
