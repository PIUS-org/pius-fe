import type { TagTone } from '@/shared/ui/tag';
import type { ClientStatus } from './types';

/** 진행여부 → 태그 색. 잠재만 outline 이다. */
export function clientStatusTone(status: ClientStatus): TagTone {
  switch (status) {
    case 'ONGOING':
      return 'accent';
    case 'POTENTIAL':
      return 'outline';
    case 'DONE':
      return 'neutral';
  }
}
