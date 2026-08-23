'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { homePathOf } from '@/entities/account/role';
import type { Role } from '@/entities/account/types';
import { useAccessDenied } from '../access-denied';
import { canAccessPath } from '../nav';

/**
 * 권한 밖 경로에 직접 들어온 경우를 막는다.
 *
 * 주소창에 `/hr` 을 쳐서 들어오면 사이드바를 거치지 않으므로 여기서 잡는다.
 * 서버도 403 을 내지만, 그 전에 안내하고 갈 수 있는 곳으로 보내는 편이 낫다.
 *
 * **이 가드는 사용자 경험용이다.** 실제 차단은 서버가 한다.
 */
export function RouteGuard({ role, children }: { role: Role; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { showAccessDenied } = useAccessDenied();

  const allowed = canAccessPath(pathname, role);

  useEffect(() => {
    if (allowed) return;
    showAccessDenied();
    router.replace(homePathOf(role));
  }, [allowed, role, router, showAccessDenied]);

  // 권한 밖이면 내용이 잠깐이라도 보이지 않게 한다.
  return allowed ? children : null;
}
