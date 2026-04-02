'use client';

/**
 * @fileoverview 首页 - 搜索入口 + 榜单
 */

import { useState } from 'react';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { ChartList } from '@/components/search/ChartList';
import { InspirationWall } from '@/components/inspiration/InspirationWall';

export default function HomePage() {
  const [mode, setMode] = useState<'search' | 'charts' | 'inspiration'>('search');

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:py-8 md:py-10">
      <div
        className={`flex w-full flex-col items-stretch ${mode === 'inspiration' ? 'max-w-4xl' : 'max-w-2xl'}`}
      >
        {/* 品牌区 */}
        <div className="mb-5 text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            歌词
            <span className="bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
              广场
            </span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            歌词美学重塑 · 一键生成精美歌词卡片
          </p>
          <a
            href="https://daliuai.top/about"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 rounded-full bg-secondary px-4 py-1.5 text-sm text-secondary-foreground hover:bg-secondary/80 transition-colors"
          >
            关于我们
          </a>
        </div>

        {/* 模式切换 */}
        <div className="mb-4 flex flex-wrap justify-center gap-2 sm:gap-3">
          <button
            onClick={() => setMode('search')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all sm:px-5 ${
              mode === 'search'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            搜索
          </button>
          <button
            onClick={() => setMode('charts')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all sm:px-5 ${
              mode === 'charts'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            云音乐特色版
          </button>
          <button
            onClick={() => setMode('inspiration')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all sm:px-5 ${
              mode === 'inspiration'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            灵感
          </button>
        </div>

        {/* 搜索 */}
        {mode === 'search' && (
          <>
            <SearchBar />
            <SearchResults />
          </>
        )}

        {/* 榜单 */}
        {mode === 'charts' && (
          <div className="rounded-xl border bg-card p-4">
            <ChartList />
          </div>
        )}

        {mode === 'inspiration' && (
          <div className="rounded-xl border bg-card p-4 sm:p-5">
            <InspirationWall />
          </div>
        )}
      </div>
    </main>
  );
}