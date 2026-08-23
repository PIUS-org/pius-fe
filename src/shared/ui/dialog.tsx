'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  /** 하단 버튼 영역 */
  actions?: ReactNode;
  width?: number;
};

/**
 * 프로젝트 종료 · 인력 추가 · 담당자 추가 · 접근 권한 안내에 쓰는 모달.
 *
 * Radix 를 쓰는 이유는 포커스 트랩과 Esc 닫기를 직접 만들지 않기 위해서다.
 * 목업은 배경 div 만 두고 있어 키보드로 빠져나갈 수 없다.
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  actions,
  width = 440,
}: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 grid place-items-center bg-neutral-900/50 p-4">
          <DialogPrimitive.Content
            style={{ width: `min(${width}px, 100%)` }}
            className={cn(
              'border-divider flex flex-col gap-2.5 border bg-neutral-100 p-4 shadow-lg',
              'focus:outline-none',
            )}
          >
            <DialogPrimitive.Title className="font-heading text-xl">{title}</DialogPrimitive.Title>

            {description ? (
              <DialogPrimitive.Description className="text-sm opacity-85">
                {description}
              </DialogPrimitive.Description>
            ) : (
              /* Radix 는 Description 이 없으면 경고한다. 시각적으로 숨겨 접근성만 유지한다. */
              <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
            )}

            {children}

            {actions && <div className="mt-2 flex justify-end gap-2">{actions}</div>}
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export const DialogClose = DialogPrimitive.Close;
