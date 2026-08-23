'use client';

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '@/shared/lib/cn';

export type RadioOption<T extends string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

type RadioGroupProps<T extends string> = {
  name: string;
  value: T | undefined;
  onChange: (value: T) => void;
  options: readonly RadioOption<T>[];
  /** 세로 배치. 기본은 가로. */
  vertical?: boolean;
  className?: string;
};

/**
 * 목업의 `.radio` — 네이티브 인풋을 숨기고 점을 직접 그린다.
 *
 * Radix 를 쓰는 이유는 화살표 키 이동과 포커스 관리를 직접 만들지 않기 위해서다.
 */
export function RadioGroup<T extends string>({
  name,
  value,
  onChange,
  options,
  vertical,
  className,
}: RadioGroupProps<T>) {
  return (
    <RadioGroupPrimitive.Root
      name={name}
      value={value}
      onValueChange={(next) => onChange(next as T)}
      className={cn('flex gap-4.5', vertical && 'flex-col gap-2.5', className)}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            'group inline-flex cursor-pointer items-center gap-2 text-sm',
            option.disabled && 'cursor-not-allowed opacity-50',
          )}
        >
          <RadioGroupPrimitive.Item
            value={option.value}
            disabled={option.disabled}
            className={cn(
              'border-divider size-4 flex-none rounded-full border-[1.5px] bg-transparent',
              'group-hover:border-accent',
              'data-[state=checked]:border-accent data-[state=checked]:bg-accent',
              'data-[state=checked]:shadow-[inset_0_0_0_4px_var(--color-bg)]',
              'disabled:group-hover:border-divider',
            )}
          />
          {option.label}
        </label>
      ))}
    </RadioGroupPrimitive.Root>
  );
}
