'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

type ToastContextValue = {
  /** 우측 하단에 잠깐 띄운다. 저장 완료 같은 짧은 확인용이다. */
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

/** 목업과 같은 2.2초. */
const DURATION_MS = 2200;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((next: string) => {
    setMessage(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setMessage(''), DURATION_MS);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* aria-live 로 스크린리더에도 읽히게 한다 */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed right-6 bottom-6 z-[60]"
      >
        {message && (
          <div className="bg-accent-900 text-bg px-4.5 py-3 text-[13.5px] shadow-md">{message}</div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast 는 ToastProvider 안에서만 쓸 수 있습니다.');
  }
  return context;
}
