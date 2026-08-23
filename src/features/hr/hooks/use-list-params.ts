'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

/**
 * 목록 화면의 검색·필터·페이지를 URL 에 둔다.
 *
 * 상태를 컴포넌트에 담으면 뒤로가기로 목록에 돌아왔을 때 조건이 초기화되고,
 * 특정 검색 결과를 동료에게 링크로 보낼 수도 없다.
 */
export function useListParams<Status extends string>(defaultStatus: Status) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const params = useMemo(
    () => ({
      q: searchParams.get('q') ?? '',
      status: (searchParams.get('status') as Status | null) ?? defaultStatus,
      page: Number(searchParams.get('page') ?? '1') || 1,
    }),
    [searchParams, defaultStatus],
  );

  const update = useCallback(
    (next: Partial<{ q: string; status: Status; page: number }>) => {
      const merged = { ...params, ...next };
      // 조건이 바뀌면 첫 페이지부터 다시 본다.
      if (next.page === undefined && (next.q !== undefined || next.status !== undefined)) {
        merged.page = 1;
      }

      const query = new URLSearchParams();
      if (merged.q) query.set('q', merged.q);
      if (merged.status !== defaultStatus) query.set('status', merged.status);
      if (merged.page > 1) query.set('page', String(merged.page));

      const queryString = query.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    },
    [params, defaultStatus, pathname, router],
  );

  return { params, update };
}
