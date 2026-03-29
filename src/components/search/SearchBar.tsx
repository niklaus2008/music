'use client';

/**
 * @fileoverview 首页搜索栏组件
 * 提供大号搜索输入与按钮，在回车或点击时调用全局 store 的 `search` 方法。
 */

import { useCallback, useState } from 'react';
import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSongStore } from '@/store/song-store';
import { cn } from '@/lib/utils';

/**
 * 居中的响应式搜索栏：移动端全宽，桌面端最大宽度 `max-w-2xl`。
 *
 * @returns 搜索栏 JSX
 */
export function SearchBar() {
  const search = useSongStore((s) => s.search);
  const [value, setValue] = useState('');

  /**
   * 在关键词非空时触发搜索。
   */
  const runSearch = useCallback(() => {
    const q = value.trim();
    if (!q) return;
    void search(q);
  }, [value, search]);

  return (
    <div className={cn('mx-auto w-full max-w-2xl px-4 md:px-0')}>
      <div
        className={cn(
          'flex w-full items-stretch gap-2 rounded-2xl border border-border/80 bg-background/80 p-1.5 shadow-sm',
          'backdrop-blur-sm transition-shadow focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30'
        )}
      >
        <div className="relative flex min-w-0 flex-1 items-center">
          <Search
            className="pointer-events-none absolute left-3 size-5 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                runSearch();
              }
            }}
            placeholder="搜索歌名、歌手、专辑或歌词..."
            className={cn(
              'h-12 border-0 bg-transparent pl-11 pr-3 text-base shadow-none',
              'focus-visible:ring-0 md:text-base'
            )}
            aria-label="搜索歌曲"
          />
        </div>
        <Button
          type="button"
          size="lg"
          className="shrink-0 rounded-xl px-5"
          onClick={runSearch}
        >
          搜索
        </Button>
      </div>
    </div>
  );
}
