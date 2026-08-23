import { PersonDetail } from '@/features/hr/components/person-detail';

export const metadata = { title: '인사 상세 · PiUS' };

/** Next 16 에서 params 는 Promise 다. */
export default async function PersonDetailPage({
  params,
}: {
  params: Promise<{ personId: string }>;
}) {
  const { personId } = await params;
  return <PersonDetail personId={Number(personId)} />;
}
