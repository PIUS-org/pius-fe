'use client';

import { useRef } from 'react';
import { cn } from '@/shared/lib/cn';
import { Button } from './button';

/**
 * 이 컴포넌트가 그리는 데 필요한 최소 정보.
 *
 * 도메인 타입(`entities/person/types` 의 `Attachment`)을 직접 참조하지 않는다 —
 * `shared` 는 가장 아래 레이어라 위쪽을 알면 안 된다. 대신 제네릭으로 받아
 * 콜백에는 호출한 쪽의 타입이 그대로 전달되게 한다.
 */
export type UploadedFile = {
  attachmentId: number;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  createdAt: string;
};

type FileUploadProps<T extends UploadedFile> = {
  files: readonly T[];
  onSelect?: (file: File) => void;
  onOpen?: (file: T) => void;
  onDelete?: (file: T) => void;
  /** 읽기 전용 — 용역 계정처럼 업로드 권한이 없을 때 */
  readOnly?: boolean;
  className?: string;
};

const ACCEPT = 'application/pdf,image/png,image/jpeg,image/webp';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

function fileKind(contentType: string): string {
  return contentType === 'application/pdf' ? 'PDF' : 'IMG';
}

/** 계약서 · 사업자등록증 목록과 업로드 영역. */
export function FileUpload<T extends UploadedFile>({
  files,
  onSelect,
  onOpen,
  onDelete,
  readOnly,
  className,
}: FileUploadProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={cn('flex flex-col gap-2.5', className)}>
      {files.map((file) => (
        <div
          key={file.attachmentId}
          className="bg-bg border-divider flex items-center gap-3 border px-3.5 py-3"
        >
          <div className="border-divider text-accent-700 grid h-10 w-8 flex-none place-items-center border text-[10px]">
            {fileKind(file.contentType)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13.5px]">{file.fileName}</div>
            <div className="text-muted text-[11.5px]">
              {file.createdAt.slice(0, 10)} 업로드 · {formatSize(file.sizeBytes)}
            </div>
          </div>
          {onOpen && (
            <Button variant="secondary" size="sm" onClick={() => onOpen(file)}>
              보기
            </Button>
          )}
          {!readOnly && onDelete && (
            <Button variant="ghost" size="sm" onClick={() => onDelete(file)}>
              삭제
            </Button>
          )}
        </div>
      ))}

      {!readOnly && onSelect && (
        <div className="border-divider flex items-center gap-2.5 border border-dashed p-3.5">
          <span className="text-muted flex-1 text-[12.5px]">
            PDF · 이미지 파일 업로드 (최대 10MB)
          </span>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onSelect(file);
              // 같은 파일을 연속으로 고를 수 있도록 값을 비운다
              event.target.value = '';
            }}
          />
          <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
            파일 선택
          </Button>
        </div>
      )}

      {readOnly && files.length === 0 && (
        <p className="text-muted text-[12.5px]">등록된 문서가 없습니다.</p>
      )}
    </div>
  );
}
