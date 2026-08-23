'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

/**
 * 목업의 `.btn` 계열.
 *
 * 제목 폰트를 쓰는 것이 특징이다 — 버튼 라벨이 본문보다 앞으로 나와야 하기 때문이다.
 */
const buttonVariants = cva(
  cn(
    'inline-flex cursor-pointer items-center justify-center gap-1.5',
    'border font-heading leading-tight whitespace-nowrap',
    'transition-colors disabled:cursor-not-allowed disabled:opacity-45',
  ),
  {
    variants: {
      variant: {
        primary: 'border-accent bg-accent text-bg hover:bg-accent-600 active:bg-accent-700',
        secondary: 'border-divider text-text hover:bg-text/7 active:bg-text/14 bg-transparent',
        ghost:
          'hover:bg-accent/10 active:bg-accent/18 border-transparent bg-transparent text-accent',
        /* 사이드바처럼 어두운 면 위에 놓이는 버튼 */
        inverse: 'border-bg/30 text-bg hover:bg-bg/10 active:bg-bg/20 bg-transparent',
      },
      size: {
        sm: 'px-3 py-1 text-xs',
        md: 'px-4 py-1.5 text-sm',
        lg: 'h-[42px] px-5 text-sm',
        icon: 'h-9 w-9 p-0',
      },
      block: {
        true: 'w-full',
      },
    },
    defaultVariants: { variant: 'secondary', size: 'md' },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, block, type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    />
  );
});

export { buttonVariants };
