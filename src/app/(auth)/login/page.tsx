import { Suspense } from 'react';
import { LoginForm } from '@/features/auth/components/login-form';

export const metadata = {
  title: '로그인 · PiUS 업무관리 시스템',
};

/**
 * 로그인.
 *
 * 좌측은 브랜드 패널, 우측은 입력 카드인 2단 구성이다.
 * 폼이 `useSearchParams` 로 `next` 를 읽으므로 Suspense 로 감싼다.
 */
export default function LoginPage() {
  return (
    <div className="bg-bg grid min-h-screen grid-cols-[1.1fr_1fr]">
      <div className="bg-accent-900 text-bg flex flex-col justify-between px-[60px] py-14">
        <div className="font-heading text-xs tracking-[0.22em] uppercase opacity-65">
          PiUS system &amp; consulting
        </div>

        <div>
          <h1 className="font-heading text-[56px] leading-[1.04] tracking-[-0.02em]">
            업무관리 시스템
          </h1>
          <p className="mt-4 max-w-[400px] text-[14.5px] leading-[1.75] opacity-70">
            인력 · 거래처 · 프로젝트 정보를 하나의 시스템에서 관리하고, 서로 연결된 정보를 한 번에
            확인합니다.
          </p>
        </div>

        <div className="text-[11.5px] opacity-45">© PiUS. 사내 전용 시스템 · v1.0</div>
      </div>

      <div className="grid place-items-center p-10">
        <Suspense fallback={<div className="w-[348px]" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
