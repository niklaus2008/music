'use client';

/**
 * @fileoverview 首页 - 搜索入口 + 榜单
 */

import { useState } from 'react';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { ChartList } from '@/components/search/ChartList';

export default function HomePage() {
  const [mode, setMode] = useState<'search' | 'charts'>('search');

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:py-8 md:py-10">
      <div className="flex w-full max-w-2xl flex-col items-stretch">
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
        </div>

        {/* 模式切换 */}
        <div className="mb-4 flex justify-center gap-3">
          <button
            onClick={() => setMode('search')}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
              mode === 'search'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            搜索
          </button>
          <button
            onClick={() => setMode('charts')}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
              mode === 'charts'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            云音乐特色版
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
      </div>
    </main>
  );
}