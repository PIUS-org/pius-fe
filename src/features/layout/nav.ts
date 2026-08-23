import { canManageInternalData } from '@/entities/account/role';
import type { Role } from '@/entities/account/types';

export type NavItem = {
  href: string;
  label: string;
  /** 이 메뉴를 열 수 있는지. 못 열면 "권한 없음" 배지가 붙는다. */
  canAccess: (role: Role) => boolean;
};

/**
 * 사이드바 메뉴.
 *
 * 접근 가능 여부를 여기서 판정하지 않고 `entities/account/role.ts` 의 함수를 가리킨다.
 * 권한 규칙이 두 곳에 생기면 한쪽만 고쳐진다.
 */
export const NAV_ITEMS: readonly NavItem[] = [
  { href: '/hr', label: '인사관리', canAccess: canManageInternalData },
  { href: '/clients', label: '거래처관리', canAccess: canManageInternalData },
  { href: '/projects', label: '프로젝트관리', canAccess: () => true },
];

/** 현재 경로가 어느 메뉴에 속하는지. 상세 화면(`/hr/3`)도 인사관리로 본다. */
export function activeNavHref(pathname: string): string | null {
  return (
    NAV_ITEMS.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
      ?.href ?? null
  );
}

/** 경로에 들어갈 수 있는지. 라우트 가드가 쓴다. */
export function canAccessPath(pathname: string, role: Role): boolean {
  const item = NAV_ITEMS.find(
    (nav) => pathname === nav.href || pathname.startsWith(`${nav.href}/`),
  );
  return item ? item.canAccess(role) : true;
}
