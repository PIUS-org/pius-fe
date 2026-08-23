'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import type { AccountSummary } from '@/entities/account/types';
import { useAuth } from '@/features/auth/auth-provider';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { useAccessDenied } from '../access-denied';
import { activeNavHref, NAV_ITEMS } from '../nav';

/**
 * 좌측 고정 사이드바.
 *
 * 열 수 없는 메뉴는 숨기지 않고 "권한 없음" 배지와 함께 흐리게 남긴다.
 * 목업의 선택이며, 어떤 기능이 있는지는 알되 지금은 쓸 수 없음을 드러내는 편이 낫다.
 */
export function AppSidebar({ account }: { account: AccountSummary }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { showAccessDenied } = useAccessDenied();
  const [loggingOut, setLoggingOut] = useState(false);

  const active = activeNavHref(pathname);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    await logout();
    router.replace('/login');
  }

  return (
    <aside className="bg-accent-900 text-bg flex w-[230px] flex-none flex-col">
      <div className="border-bg/14 flex items-center gap-2.5 border-b px-4.5 py-5">
        <div className="bg-bg grid size-9 flex-none place-items-center">
          <Image src="/pius-logo.png" alt="" width={19} height={26} className="h-[26px] w-auto" />
        </div>
        <div className="min-w-0">
          <div className="font-heading text-[19px] leading-none font-semibold tracking-[0.03em]">
            PiUS
          </div>
          <div className="text-[11px] opacity-60">업무관리 시스템 v1.0</div>
        </div>
      </div>

      <nav className="flex flex-col py-3">
        {NAV_ITEMS.map((item) => {
          const allowed = item.canAccess(account.role);
          const isActive = active === item.href;

          const className = cn(
            'font-heading flex w-full items-center justify-between gap-2 border-l-[3px] px-4 py-2.5 text-left',
            'text-[16.5px] tracking-[0.02em] transition-colors',
            isActive ? 'border-accent-300 bg-bg/12 opacity-100' : 'border-transparent opacity-78',
            allowed ? 'hover:bg-bg/8' : 'cursor-not-allowed opacity-42',
          );

          if (!allowed) {
            return (
              <button
                key={item.href}
                type="button"
                aria-disabled
                onClick={showAccessDenied}
                className={className}
              >
                <span>{item.label}</span>
                <span className="text-[10px] tracking-[0.06em] opacity-80">권한 없음</span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={className}
            >
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-bg/14 mt-auto border-t px-4 pt-4 pb-4.5">
        <div className="text-[13.5px] font-medium">{account.name}</div>
        <div className="mb-3 text-[11.5px] opacity-60">
          {account.roleLabel}
          {account.jobTitle && ` · ${account.jobTitle}`}
        </div>
        <Button variant="inverse" block disabled={loggingOut} onClick={handleLogout}>
          {loggingOut ? '로그아웃 중…' : '로그아웃'}
        </Button>
      </div>
    </aside>
  );
}
