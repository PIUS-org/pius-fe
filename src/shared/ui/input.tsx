'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

export const inputClassName = cn(
  'w-full min-h-9 px-2.5 py-1.5 text-sm',
  'bg-surface text-text caret-accent border border-divider',
  'placeholder:text-muted-weak',
  'hover:border-text/45 focus-visible:border-accent focus-visible:outline-offset-0',
  'read-only:text-muted read-only:hover:border-divider',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** 검증 실패 표시. 메시지는 Field 가 그린다. */
  invalid?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(inputClassName, invalid && 'border-danger hover:border-danger', className)}
      {...props}
    />
  );
});
