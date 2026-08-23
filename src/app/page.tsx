import { env } from '@/shared/config/env';

/**
 * 스캐폴딩 확인용 임시 화면.
 *
 * 실제 라우팅(로그인 · 권한별 리다이렉트)은 #5 · #6 에서 붙인다.
 */
export default function Home() {
  return (
    <main style={{ padding: '40px', lineHeight: 1.8 }}>
      <h1>PiUS 업무관리 시스템</h1>
      <p>프론트엔드 스캐폴딩이 정상 동작합니다.</p>
      <dl>
        <dt>환경</dt>
        <dd>{env.appEnv}</dd>
        <dt>API</dt>
        <dd>{env.apiBaseUrl}</dd>
      </dl>
    </main>
  );
}
