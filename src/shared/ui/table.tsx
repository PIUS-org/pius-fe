'use client';

import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

export type Column<T> = {
  key: string;
  header: ReactNode;
  /** 셀 렌더러. 값 가공은 여기서 한다. */
  cell: (row: T) => ReactNode;
  width?: number | string;
  align?: 'left' | 'right';
  /** 줄바꿈 없이 한 줄로. 날짜·번호 열에 쓴다. */
  nowrap?: boolean;
  /** 금액·날짜 자릿수 정렬 */
  tabular?: boolean;
};

type TableProps<T> = {
  columns: readonly Column<T>[];
  rows: readonly T[];
  rowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  /** 행이 없을 때 그릴 내용 */
  empty?: ReactNode;
  className?: string;
};

/**
 * 목록 테이블.
 *
 * 행 클릭은 `div onClick` 이 아니라 키보드로도 열 수 있게 처리한다 —
 * 목업은 `tr onClick` 만 두고 있어 키보드 사용자가 상세로 갈 수 없다.
 */
export function Table<T>({ columns, rows, rowKey, onRowClick, empty, className }: TableProps<T>) {
  if (rows.length === 0 && empty) {
    return <>{empty}</>;
  }

  return (
    <table className={cn('w-full border-collapse text-sm', className)}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              scope="col"
              style={column.width ? { width: column.width } : undefined}
              className={cn(
                'text-muted border-divider border-b p-2 text-[11px] font-normal tracking-[0.08em] uppercase',
                column.align === 'right' ? 'text-right' : 'text-left',
              )}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={rowKey(row)}
            {...(onRowClick && {
              role: 'button',
              tabIndex: 0,
              onClick: () => onRowClick(row),
              onKeyDown: (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onRowClick(row);
                }
              },
            })}
            className={cn(
              'border-text/8 border-b last:border-b-0',
              onRowClick && 'hover:bg-text/4 focus-visible:bg-text/4 cursor-pointer',
            )}
          >
            {columns.map((column) => (
              <td
                key={column.key}
                className={cn(
                  'p-2',
                  column.align === 'right' && 'text-right',
                  column.nowrap && 'whitespace-nowrap',
                  column.tabular && 'tabular',
                )}
              >
                {column.cell(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
