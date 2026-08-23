import { Suspense } from 'react';
import { ClientList } from '@/features/client/components/client-list';

export const metadata = { title: '거래처 목록 · PiUS' };

export default function ClientsPage() {
  return (
    <Suspense>
      <ClientList />
    </Suspense>
  );
}
