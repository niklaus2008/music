/**
 * @fileoverview 搜索结果列表组件
 */

'use client';

import { useSongStore } from '@/store/song-store';
import { SongCard } from './SongCard';
import { Skeleton } from '@/components/ui/skeleton';

export function SearchResults() {
  const { searchResults, searching, keyword, searchError } = useSongStore();

  if (searching) {
    return (
      <div className="w-full max-w-xl space-y-2 mt-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3">
            <Skeleton className="w-14 h-14 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3 w-2/5" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!keyword) return null;

  if (searchError) {
    return (
      <div
        className="w-full max-w-xl mt-8 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-center text-sm text-destructive"
        role="alert"
      >
        {searchError}
      </div>
    );
  }

  if (searchResults.length === 0) {
    return (
      <div className="w-full max-w-xl mt-8 text-center text-muted-foreground">
        <p>未找到相关歌曲，换个关键词试试</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mt-4 space-y-1">
      <p className="text-sm text-muted-foreground mb-3 px-1">
        找到 {searchResults.length} 首相关歌曲，点击确认
      </p>
      {searchResults.map((song) => (
        <SongCard key={song.id} song={song} />
      ))}
    </div>
  );
}
