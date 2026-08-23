'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

export type TabItem = {
  value: string;
  label: string;
};

type TabsProps = {
  items: readonly TabItem[];
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
};

/** 상세 화면의 탭. 선택된 탭만 아래에 2px 액센트 선이 붙는다. */
export function Tabs({ items, value, onChange, children, className }: TabsProps) {
  return (
    <TabsPrimitive.Root value={value} onValueChange={onChange} className={className}>
      <TabsPrimitive.List className="border-divider mb-5 flex gap-0.5 border-b">
        {items.map((item) => (
          <TabsPrimitive.Trigger
            key={item.value}
            value={item.value}
            className={cn(
              'font-heading cursor-pointer border-0 border-b-2 border-transparent bg-transparent px-4 py-2.5',
              'text-[15.5px] tracking-[0.02em] transition-colors',
              'text-muted hover:text-accent-800',
              'data-[state=active]:border-accent data-[state=active]:text-accent-800',
            )}
          >
            {item.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {children}
    </TabsPrimitive.Root>
  );
}

export const TabPanel = TabsPrimitive.Content;
