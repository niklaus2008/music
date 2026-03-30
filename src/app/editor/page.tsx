'use client';

/**
 * @fileoverview 歌词排版编辑器页
 * 桌面：左侧控制区 + 右侧画布；小屏：画布优先，底部固定栏打开「样式与导出」抽屉。
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LyricCanvas } from '@/components/editor/LyricCanvas';
import { EditorControlsPanel } from '@/components/editor/EditorControlsPanel';
import { useSongStore } from '@/store/song-store';

export default function EditorPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const { currentSong, parsedLyric, loadingLyric, lyricError } = useSongStore();

  useEffect(() => {
    if (!currentSong) {
      router.replace('/');
    }
  }, [currentSong, router]);

  if (!currentSong) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <p className="text-muted-foreground">正在跳转…</p>
      </div>
    );
  }

  return (
    <main
      className={cn(
        'mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pt-[max(1.5rem,env(safe-area-inset-top))]',
        'pb-[calc(4.75rem+env(safe-area-inset-bottom))] md:flex-row md:pb-10 md:pt-10'
      )}
    >
      {/* 桌面：侧栏控制区 */}
      <aside className="order-2 hidden w-full shrink-0 flex-col gap-4 md:order-1 md:flex md:w-[min(100%,380px)]">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'sm' }),
              '-ml-2 gap-1 inline-flex'
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            重新搜索
          </Link>
        </div>

        <Card>
          <EditorControlsPanel canvasRef={canvasRef} />
        </Card>
      </aside>

      {/* 画布预览 */}
      <section className="order-1 min-w-0 flex-1 md:order-2">
        <div className="sticky top-4 rounded-xl border bg-card p-3 shadow-sm">
          <p className="mb-3 text-center text-xs text-muted-foreground">
            实时预览 · 导出尺寸与下方画布一致
          </p>
          {loadingLyric ? (
            <Skeleton className="mx-auto aspect-[3/4] w-full max-w-md rounded-lg" />
          ) : parsedLyric ? (
            <LyricCanvas ref={canvasRef} />
          ) : (
            <div
              className="flex min-h-[240px] flex-col items-center justify-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-4 text-center text-sm text-destructive"
              role="alert"
            >
              {lyricError ?? '未能加载歌词'}
            </div>
          )}
        </div>
      </section>

      {/* 小屏：底部固定栏，打开控制区抽屉 */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t bg-background/95 p-3',
          'pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md supports-[backdrop-filter]:bg-background/80',
          'md:hidden'
        )}
      >
        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: 'outline', size: 'sm' }),
            'shrink-0 gap-1.5 inline-flex'
          )}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          返回
        </Link>
        <Button
          type="button"
          className="min-h-11 flex-1 gap-2"
          onClick={() => setMobileSheetOpen(true)}
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          样式与导出
        </Button>
      </div>

      <Dialog open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
        <DialogContent
          showCloseButton
          className={cn(
            'top-auto bottom-0 left-0 right-0 max-h-[min(92vh,900px)] w-full max-w-full translate-x-0 translate-y-0',
            'rounded-t-2xl rounded-b-none border-x-0 p-0 sm:max-w-full',
            'flex flex-col gap-0 overflow-hidden'
          )}
        >
          <DialogHeader className="shrink-0 border-b border-border/60 px-4 pt-4 pb-3">
            <DialogTitle>编辑与导出</DialogTitle>
            <DialogDescription>
              调整模板、比例与字体后导出图片；关闭本面板不影响已选样式。
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6">
            <Card className="border-0 py-3 shadow-none ring-0">
              <EditorControlsPanel canvasRef={canvasRef} />
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
