'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

/**
 * Input · Textarea · Select 가 공유하는 클래스.
 *
 * 상태 위계는 기본 < 호버 < 포커스 순이다. 예전에는 포커스가 테두리 색만 바꾸고
 * 호버가 더 진한 테두리를 써서, 포커스가 호버보다 약해 보였다 — "눌러도 아무
 * 일도 안 일어난다" 로 읽히던 원인이다. 이제 포커스에서 배경이 흰색으로 떠오른다.
 */
export const inputClassName = cn(
  'w-full min-h-9 px-2.5 py-1.5 text-sm transition-colors',
  'bg-surface text-text caret-accent border border-divider',
  'placeholder:text-placeholder',
  'hover:border-text/30',
  // 배경·테두리는 focus 로 잡는다. focus-visible 은 키보드로 왔을 때만 켜져서,
  // 마우스로 클릭해 입력하는 경우에 아무 변화가 없었다.
  // 키보드 링(outline)만 focus-visible 로 남긴다.
  'focus:bg-input-focus focus:border-accent focus-visible:outline-offset-0',
  // 읽기전용·비활성은 포커스를 받아도 올라오지 않는다. 입력할 수 없으니 떠오르면 거짓말이다.
  'read-only:text-muted read-only:hover:border-divider',
  'read-only:focus:bg-surface read-only:focus:border-divider',
  'disabled:cursor-not-allowed disabled:opacity-50 disabled:focus:bg-surface',
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
