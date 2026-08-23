'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { homePathOf } from '@/entities/account/role';
import { isApiError } from '@/shared/api/error';
import { env } from '@/shared/config/env';
import { Button } from '@/shared/ui/button';
import { Field } from '@/shared/ui/field';
import { Input } from '@/shared/ui/input';
import { useAuth } from '../auth-provider';

/** 로컬에서만 보여주는 시드 계정 안내. 목업의 "데모 계정 권한" 자리를 대신한다. */
const SEED_ACCOUNTS = [
  { loginId: 'siochoi', label: '정직원 · 최시온' },
  { loginId: 'haneul', label: '용역 · 이하늘' },
] as const;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setError(null);
    setSubmitting(true);
    try {
      const account = await login(loginId.trim(), password);
      // 원래 가려던 곳이 있으면 그리로, 없으면 권한에 맞는 첫 화면으로.
      const next = searchParams.get('next');
      router.replace(next ?? homePathOf(account.role));
    } catch (cause) {
      setError(
        isApiError(cause)
          ? cause.message
          : '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      );
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-divider w-[348px] border bg-neutral-100 px-8 py-[34px]"
    >
      <Image
        src="/pius-logo.png"
        alt="PiUS"
        width={72}
        height={68}
        priority
        className="mx-auto mb-5.5 h-auto w-[72px]"
      />

      <h2 className="font-heading mb-0.5 text-[22px] leading-tight">로그인</h2>
      <p className="text-muted mb-5.5 text-[12.5px]">사내 계정으로 로그인하세요.</p>

      <div className="flex flex-col gap-3">
        <Field label="아이디">
          {({ id }) => (
            <Input
              id={id}
              name="loginId"
              autoComplete="username"
              autoFocus
              required
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
            />
          )}
        </Field>

        <Field label="비밀번호">
          {({ id }) => (
            <Input
              id={id}
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          )}
        </Field>
      </div>

      {error && (
        <p role="alert" className="text-danger mt-3 text-[12.5px]">
          {error}
        </p>
      )}

      <p className="text-muted mt-4.5 text-[11.5px] leading-relaxed">
        최초 발급 비밀번호는 <span className="text-text">0000</span> 입니다. 비밀번호 변경 · 찾기는
        다음 버전에서 제공합니다.
      </p>

      {env.appEnv === 'docker' && (
        <div className="border-divider mt-4 border-t pt-4">
          <div className="text-muted mb-2 text-[11px] tracking-[0.1em] uppercase">
            로컬 시드 계정
          </div>
          <div className="flex gap-2">
            {SEED_ACCOUNTS.map((account) => (
              <Button
                key={account.loginId}
                size="sm"
                className="flex-1"
                onClick={() => {
                  setLoginId(account.loginId);
                  setPassword('0000');
                }}
              >
                {account.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        block
        disabled={submitting}
        className="mt-4"
      >
        {submitting ? '로그인 중…' : '로그인'}
      </Button>
    </form>
  );
}
