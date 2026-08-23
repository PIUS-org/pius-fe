'use client';

import { cn } from '@/shared/lib/cn';

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: readonly SegmentedOption<T>[];
  /** 스크린리더용 그룹 이름. 예: "재직여부 필터" */
  label: string;
  className?: string;
};

/**
 * 목록 화면의 필터 칩 (전체 / 재직 / 퇴사, 전체 / 예정 / 진행중 / 완료).
 *
 * 한 줄 테두리 안에서 칸을 나누고 선택된 칸만 액센트로 채운다.
 */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
}: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('border-divider inline-flex border', className)}
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'cursor-pointer px-4 py-1.5 text-[13px] transition-colors',
              index > 0 && 'border-divider border-l',
              selected ? 'bg-accent text-bg' : 'text-text hover:bg-text/7',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
