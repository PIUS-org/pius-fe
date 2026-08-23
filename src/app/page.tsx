'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { homePathOf } from '@/entities/account/role';
import { useAuth } from '@/features/auth/auth-provider';

/**
 * 진입점.
 *
 * 권한에 따라 갈 곳이 다르다 — 용역은 인사관리를 볼 수 없어 프로젝트로 보낸다.
 * 쿠키만 보는 proxy.ts 는 권한을 알 수 없으므로 여기서 판단한다.
 */
export default function Home() {
  const router = useRouter();
  const { state } = useAuth();

  useEffect(() => {
    if (state.status === 'authenticated') {
      router.replace(homePathOf(state.account.role));
    } else if (state.status === 'anonymous') {
      router.replace('/login');
    }
  }, [state, router]);

  return null;
}
