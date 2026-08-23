'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { AuthProvider } from '@/features/auth/auth-provider';
import { createQueryClient } from '@/shared/api/query-client';
import { ToastProvider } from '@/shared/ui/toast';

/**
 * 앱 전역 Provider.
 *
 * QueryClient 를 모듈 최상단이 아니라 상태로 만드는 이유는, 서버 렌더링 시
 * 요청끼리 캐시를 공유하지 않게 하기 위해서다.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>{children}</ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
