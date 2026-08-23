import { Suspense } from 'react';
import { ProjectList } from '@/features/project/components/project-list';

export const metadata = { title: '프로젝트 목록 · PiUS' };

export default function ProjectsPage() {
  return (
    <Suspense>
      <ProjectList />
    </Suspense>
  );
}
