/**
 * @fileoverview 搜索结果列表组件
 * 与搜索栏同宽（max-w-2xl），未搜索时展示功能引导。
 */

'use client';

import { useSongStore } from '@/store/song-store';
import { SongCard } from './SongCard';
import { Skeleton } from '@/components/ui/skeleton';

/** 首页未输入关键词时的简要说明 */
function SearchEmptyHints() {
  return (
    <div
      className="mt-10 w-full rounded-2xl border border-border/60 bg-muted/30 px-4 py-6 text-center sm:px-6"
      aria-live="polite"
    >
      <p className="text-sm font-medium text-foreground">开始搜索</p>
      <p className="mt-2 text-sm text-muted-foreground">
        输入歌名、歌手或专辑，从结果中选一首进入排版编辑器。
      </p>
      <ul className="mt-4 list-none space-y-2 text-left text-xs text-muted-foreground sm:text-sm">
        <li className="flex gap-2">
          <span className="text-primary" aria-hidden>
            ·
          </span>
          <span>支持模糊匹配，结果来自公开检索接口</span>
        </li>
        <li className="flex gap-2">
          <span className="text-primary" aria-hidden>
            ·
          </span>
          <span>手机与桌面均可使用，画布会随屏幕宽度缩放预览</span>
        </li>
      </ul>
    </div>
  );
}

export function SearchResults() {
  const { searchResults, searching, keyword, searchError } = useSongStore();

  if (searching) {
    return (
      <div className="mt-6 w-full space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3">
            <Skeleton className="h-14 w-14 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-3/5 max-w-[14rem]" />
              <Skeleton className="h-3 w-2/5 max-w-[10rem]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!keyword) {
    return <SearchEmptyHints />;
  }

  if (searchError) {
    return (
      <div
        className="mt-8 w-full rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-center text-sm text-destructive"
        role="alert"
      >
        {searchError}
      </div>
    );
  }

  if (searchResults.length === 0) {
    return (
      <div className="mt-8 w-full text-center text-muted-foreground">
        <p>未找到相关歌曲，换个关键词试试</p>
      </div>
    );
  }

  return (
    <div className="mt-4 w-full space-y-1">
      <p className="mb-3 px-1 text-sm text-muted-foreground">
        找到 {searchResults.length} 首相关歌曲，点击确认
      </p>
      {searchResults.map((song) => (
        <SongCard key={song.id} song={song} />
      ))}
    </div>
  );
}
