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
    <main className="flex flex-1 flex-col items-center px-4 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))] sm:py-12 md:py-24">
      <div className="flex w-full max-w-2xl flex-col items-stretch">
        {/* 品牌区 */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            歌词<span className="text-primary/70">广场</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            歌词美学重塑 · 一键生成精美歌词卡片
          </p>
        </div>

        {/* 模式切换 */}
        <div className="mb-4 flex justify-center gap-2">
          <button
            onClick={() => setMode('search')}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              mode === 'search'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            搜索
          </button>
          <button
            onClick={() => setMode('charts')}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              mode === 'charts'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
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
