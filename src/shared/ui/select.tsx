'use client';

import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';
import { inputClassName } from './input';

/**
 * 네이티브 select.
 *
 * 목업이 네이티브 select 를 쓰고 있고, 키보드·모바일 동작이 검증되어 있어 그대로 둔다.
 * 검색이나 다중 선택이 필요해지면 그때 Radix Select 로 바꾼다.
 */
export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, invalid, children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        inputClassName,
        'cursor-pointer appearance-none pr-8',
        // 네이티브 화살표 대신 토큰 색을 쓰는 삼각형을 그린다
        "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%226%22><path d=%22M0 0h10L5 6z%22 fill=%22%235d5d60%22/></svg>')] bg-[length:10px_6px] bg-[position:right_10px_center] bg-no-repeat",
        invalid && 'border-danger',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});
