import { ProjectDetail } from '@/features/project/components/project-detail';

export const metadata = { title: '프로젝트 상세 · PiUS' };

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  return <ProjectDetail projectId={Number(projectId)} />;
}
