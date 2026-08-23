'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AccountSummary } from '@/entities/account/types';
import { setAccessToken, setRefreshHandler } from '@/shared/api/client';
import { ApiError } from '@/shared/api/error';
import { authApi } from './api';

type AuthState =
  /** 새로고침 직후 — 세션이 있는지 아직 모른다. */
  | { status: 'loading' }
  | { status: 'authenticated'; account: AccountSummary }
  | { status: 'anonymous' };

type AuthContextValue = {
  state: AuthState;
  login: (loginId: string, password: string) => Promise<AccountSummary>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading' });

  /**
   * 재발급 성공 여부만 돌려준다.
   *
   * client.ts 가 401 을 만났을 때 이 함수를 부른다. 클라이언트가 인증 기능을
   * 직접 import 하면 순환 참조가 되므로 여기서 주입한다.
   */
  const refresh = useCallback(async () => {
    try {
      const result = await authApi.refresh();
      setAccessToken(result.accessToken);
      setState({ status: 'authenticated', account: result.account });
      return true;
    } catch {
      setAccessToken(null);
      setState({ status: 'anonymous' });
      return false;
    }
  }, []);

  // refresh 는 useCallback([]) 이라 참조가 고정되어 있어 ref 로 감쌀 필요가 없다.
  useEffect(() => {
    setRefreshHandler(refresh);
    return () => setRefreshHandler(null);
  }, [refresh]);

  /**
   * 새로고침 복구.
   *
   * Access 토큰은 메모리에만 있어 새로고침하면 사라진다.
   * Refresh 쿠키로 한 번 받아와 로그인 상태를 되살린다.
   *
   * refresh() 를 그대로 부르지 않고 풀어 쓴 이유는, 요청이 도는 중에 언마운트되면
   * (개발 모드의 StrictMode 이중 마운트 포함) 사라진 컴포넌트의 상태를 건드리기 때문이다.
   */
  useEffect(() => {
    let cancelled = false;

    authApi
      .refresh()
      .then((result) => {
        if (cancelled) return;
        setAccessToken(result.accessToken);
        setState({ status: 'authenticated', account: result.account });
      })
      .catch(() => {
        if (cancelled) return;
        setAccessToken(null);
        setState({ status: 'anonymous' });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (loginId: string, password: string) => {
    const result = await authApi.login(loginId, password);
    setAccessToken(result.accessToken);
    setState({ status: 'authenticated', account: result.account });
    return result.account;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // 이미 만료된 세션이면 로그아웃도 실패한다. 화면 상태는 어차피 비워야 한다.
      if (!(error instanceof ApiError)) throw error;
    } finally {
      setAccessToken(null);
      setState({ status: 'anonymous' });
    }
  }, []);

  const value = useMemo(() => ({ state, login, logout }), [state, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth 는 AuthProvider 안에서만 쓸 수 있습니다.');
  }
  return context;
}

/**
 * 로그인이 보장된 화면에서 쓴다.
 *
 * 앱 레이아웃이 인증을 확인한 뒤 렌더하므로, 여기서 상태를 매번 분기하지 않아도 된다.
 */
export function useAccount(): AccountSummary {
  const { state } = useAuth();
  if (state.status !== 'authenticated') {
    throw new Error('인증된 화면에서만 useAccount 를 쓸 수 있습니다.');
  }
  return state.account;
}
