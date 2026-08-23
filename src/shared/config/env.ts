/**
 * 환경변수 진입점.
 *
 * 다른 파일에서 `process.env` 를 직접 읽지 않는다. 오타가 나도 `undefined` 로 조용히 넘어가
 * 런타임에야 드러나기 때문이다. 여기서 한 번 검증하고 이름을 고정한다.
 */

export type AppEnv = 'docker' | 'dev' | 'prod';

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`환경변수 ${name} 가 없습니다. .env.example 을 참고해 설정해주세요.`);
  }
  return value;
}

/**
 * 브라우저에서도 쓰는 값.
 *
 * `NEXT_PUBLIC_*` 는 빌드 시점에 값이 그대로 박히므로, 참조를 리터럴로 남겨야
 * Next 가 치환할 수 있다. (`process.env[name]` 처럼 동적으로 읽으면 치환되지 않는다)
 */
export const env = {
  appEnv: (process.env.NEXT_PUBLIC_APP_ENV ?? 'docker') as AppEnv,
  apiBaseUrl: required('NEXT_PUBLIC_API_BASE_URL', process.env.NEXT_PUBLIC_API_BASE_URL),
} as const;

/**
 * 서버에서만 쓰는 값. 클라이언트 번들에 들어가지 않는다.
 *
 * 함수로 감싼 이유는 모듈을 불러오는 것만으로 클라이언트에서 터지지 않게 하기 위함이다.
 */
export function serverEnv() {
  return {
    apiInternalUrl: required('API_INTERNAL_URL', process.env.API_INTERNAL_URL),
  } as const;
}

export const isLocal = env.appEnv === 'docker';
