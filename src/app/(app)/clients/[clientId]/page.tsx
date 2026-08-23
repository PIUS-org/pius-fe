import { ClientDetail } from '@/features/client/components/client-detail';

export const metadata = { title: '거래처 상세 · PiUS' };

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  return <ClientDetail clientId={Number(clientId)} />;
}
