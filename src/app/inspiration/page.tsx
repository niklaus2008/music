'use client';

/**
 * @fileoverview 灵感广场独立页（与首页「灵感」Tab 共用组件，便于分享链接）
 */

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { InspirationWall } from '@/components/inspiration/InspirationWall';

export default function InspirationPage() {
  return (
    <main className="flex flex-1 flex-col items-center px-4 py-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] sm:py-8 md:py-10">
      <div className="flex w-full max-w-4xl flex-col items-stretch">
        <div className="mb-4 flex items-center gap-2">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              '-ml-2 gap-1 inline-flex shrink-0'
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Link>
        </div>
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">灵感广场</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            浏览官方示例，预览后可一键「做同款」
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4 sm:p-5">
          <InspirationWall />
        </div>
      </div>
    </main>
  );
}
