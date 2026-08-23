'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';

const MESSAGE =
  '용역 계정은 인사관리 · 거래처관리에 접근할 수 없으며, 프로젝트는 본인이 참여한 건만 확인할 수 있습니다.';

type AccessDeniedContextValue = {
  /** 권한 밖 동작을 시도했을 때 안내한다. */
  showAccessDenied: () => void;
};

const AccessDeniedContext = createContext<AccessDeniedContextValue | null>(null);

/**
 * "접근 권한이 없습니다" 안내.
 *
 * 잠긴 메뉴 클릭, 권한 밖 경로 진입, 목록에서 열 수 없는 항목 클릭 등
 * 여러 화면에서 같은 문구를 띄우므로 한 곳에 둔다.
 */
export function AccessDeniedProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const showAccessDenied = useCallback(() => setOpen(true), []);
  const value = useMemo(() => ({ showAccessDenied }), [showAccessDenied]);

  return (
    <AccessDeniedContext.Provider value={value}>
      {children}
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="접근 권한이 없습니다"
        description={MESSAGE}
        actions={
          <Button variant="primary" onClick={() => setOpen(false)}>
            확인
          </Button>
        }
      />
    </AccessDeniedContext.Provider>
  );
}

export function useAccessDenied() {
  const context = useContext(AccessDeniedContext);
  if (!context) {
    throw new Error('useAccessDenied 는 AccessDeniedProvider 안에서만 쓸 수 있습니다.');
  }
  return context;
}
