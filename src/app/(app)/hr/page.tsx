import { Suspense } from 'react';
import { PersonList } from '@/features/hr/components/person-list';

export const metadata = { title: '인력 목록 · PiUS' };

/** 검색·필터를 URL 에 두므로 `useSearchParams` 를 쓰는 목록을 Suspense 로 감싼다. */
export default function HrPage() {
  return (
    <Suspense>
      <PersonList />
    </Suspense>
  );
}
