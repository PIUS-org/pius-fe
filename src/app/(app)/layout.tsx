'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/features/auth/auth-provider';
import { AccessDeniedProvider } from '@/features/layout/access-denied';
import { AppSidebar } from '@/features/layout/components/app-sidebar';
import { RouteGuard } from '@/features/layout/components/route-guard';

/**
 * 로그인 이후 공통 셸.
 *
 * `proxy.ts` 가 쿠키 유무로 한 번 걸러 주지만, 쿠키가 있어도 재발급이 실패할 수 있다
 * (서버에서 무효화된 경우 등). 그래서 여기서 실제 인증 상태를 다시 확인한다.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { state } = useAuth();

  useEffect(() => {
    if (state.status === 'anonymous') {
      router.replace('/login');
    }
  }, [state.status, router]);

  if (state.status !== 'authenticated') {
    // 세션 확인 중에는 사이드바를 그리지 않는다. 로그인 화면으로 튕길 수도 있어
    // 껍데기가 잠깐 보였다 사라지면 더 어수선하다.
    return <div className="min-h-screen" aria-busy="true" />;
  }

  return (
    <AccessDeniedProvider>
      <div className="bg-bg text-text flex min-h-screen min-w-[1320px]">
        <AppSidebar account={state.account} />
        <main className="min-w-0 flex-1 px-9 pt-7 pb-16">
          <RouteGuard role={state.account.role}>{children}</RouteGuard>
        </main>
      </div>
    </AccessDeniedProvider>
  );
}
