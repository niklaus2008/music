'use client';

/**
 * @fileoverview 首页 - 搜索入口
 * 品牌标题 + 搜索栏 + 结果列表。
 */

import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center px-4 py-12 md:py-24">
      {/* 品牌区 */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Lyric<span className="text-primary/70">Canvas</span>
        </h1>
        <p className="mt-2 text-muted-foreground">
          歌词美学重塑 · 一键生成精美歌词卡片
        </p>
      </div>

      {/* 搜索 */}
      <SearchBar />

      {/* 结果 */}
      <SearchResults />
    </main>
  );
}
