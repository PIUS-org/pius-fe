import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

/**
 * 상태 표시 배지.
 *
 * 어떤 상태가 어떤 tone 인지는 화면이 아니라 `entities/*` 의 도메인 로직이 정한다.
 * 여기서는 모양만 담당한다.
 */
const tagVariants = cva(
  'inline-flex items-center px-2.5 py-0.5 text-[11px] tracking-[0.02em] whitespace-nowrap',
  {
    variants: {
      tone: {
        /* 재직 · 진행중 · 진행 */
        accent: 'bg-accent-100 text-accent-800',
        'accent-2': 'bg-accent-2-100 text-accent-2-800',
        /* 퇴사 · 완료 · 진행완료 */
        neutral: 'bg-neutral-100 text-neutral-800',
        /* 예정 · 잠재 */
        outline: 'border border-accent text-accent',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export type TagTone = NonNullable<VariantProps<typeof tagVariants>['tone']>;

export type TagProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof tagVariants>;

export function Tag({ className, tone, ...props }: TagProps) {
  return <span className={cn(tagVariants({ tone }), className)} {...props} />;
}
