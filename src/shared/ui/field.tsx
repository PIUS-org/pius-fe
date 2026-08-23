'use client';

import { useId, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

type FieldProps = {
  label: string;
  /** 라벨 옆에 흐리게 붙는 보조 설명. 예: "숫자만 입력 · 자동 하이픈" */
  hint?: ReactNode;
  /** 서버가 내려준 `error.fields[name]` 을 그대로 넣는다. */
  error?: string;
  required?: boolean;
  className?: string;
  /** 인풋에 연결할 id 를 받아 렌더한다. label 과 자동으로 묶인다. */
  children: (props: { id: string; invalid: boolean }) => ReactNode;
};

/**
 * 라벨 · 보조설명 · 에러를 묶는 폼 행.
 *
 * 인풋에 id 를 직접 붙이지 않아도 라벨이 연결되도록 render prop 을 쓴다 —
 * 연결을 잊으면 스크린리더가 라벨을 읽지 못한다.
 */
export function Field({ label, hint, error, required, className, children }: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={cn('flex flex-col', className)}>
      <label htmlFor={id} className="text-muted-strong mb-1.5 block text-xs">
        {label}
        {required && <span className="text-accent"> *</span>}
        {hint && <span className="text-muted ml-1">{hint}</span>}
      </label>

      {children({ id, invalid: Boolean(error) })}

      {error && (
        <p id={errorId} role="alert" className="text-danger mt-1.5 text-[11.5px]">
          {error}
        </p>
      )}
    </div>
  );
}
