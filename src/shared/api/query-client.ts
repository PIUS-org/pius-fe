import { QueryClient } from '@tanstack/react-query';
import { isApiError } from './error';

/**
 * 조회 기본값.
 *
 * 인사·거래처·프로젝트는 여러 사람이 동시에 고치는 데이터라 오래 캐시하지 않는다.
 * 다만 탭을 옮길 때마다 다시 부르면 화면이 깜빡이므로 30초는 신선한 것으로 본다.
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // 권한·검증 오류는 다시 시도해도 결과가 같다.
          if (isApiError(error) && error.status >= 400 && error.status < 500) return false;
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}
