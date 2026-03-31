'use client';

/**
 * @fileoverview 歌词排版编辑器页
 * 桌面：左侧控制区 + 右侧画布；小屏：画布优先，底部固定栏打开「样式与导出」抽屉。
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, SlidersHorizontal, ZoomIn, ZoomOut } from 'lucide-react';
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
import { useEditorStore } from '@/store/editor-store';

export default function EditorPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [activeA4Page, setActiveA4Page] = useState(0);
  const [previewScale, setPreviewScale] = useState(1);
  const { currentSong, parsedLyric, loadingLyric, lyricError } = useSongStore();
  const { aspectRatio, a4Layout } = useEditorStore();

  const totalPages = aspectRatio === 'A4' && parsedLyric 
    ? Math.ceil(parsedLyric.lines.length / a4Layout.linesPerPage) 
    : 1;

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
        'mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-3 pt-3 md:flex-row md:gap-6 md:px-4 md:pt-6',
        'pb-[calc(4.75rem+env(safe-area-inset-bottom))] md:pb-6'
      )}
    >
      {/* 桌面：侧栏控制区 */}
      <aside className="order-2 hidden w-full shrink-0 flex-col gap-3 md:order-1 md:flex md:w-80 lg:w-96">
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

        <Card className="shadow-lg">
          <EditorControlsPanel canvasRef={canvasRef} />
        </Card>
      </aside>

      {/* 画布预览 */}
      <section className="order-1 min-w-0 flex-1 md:order-2">
        <div className="sticky top-3 rounded-xl border bg-muted/30 p-3 shadow-sm">
          {/* 缩放控制 */}
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setPreviewScale(s => Math.max(0.5, s - 0.1))}
              >
                <ZoomOut className="h-3 w-3" />
              </Button>
              <span className="text-xs text-muted-foreground w-12 text-center">
                {Math.round(previewScale * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setPreviewScale(s => Math.min(2, s + 0.1))}
              >
                <ZoomIn className="h-3 w-3" />
              </Button>
            </div>
            
            {/* A4 多页模式：页码切换 */}
            {aspectRatio === 'A4' && parsedLyric && totalPages > 1 && (
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={cn(
                      'rounded px-2 py-0.5 text-xs transition-all duration-200',
                      i === activeA4Page
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    )}
                    onClick={() => {
                      setActiveA4Page(i);
                      window.dispatchEvent(new CustomEvent('set-a4-page', { detail: { page: i } }));
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="mb-2 text-center text-xs text-muted-foreground">
            实时预览 · 导出尺寸与下方画布一致
          </p>
          
          {loadingLyric ? (
            <Skeleton className="mx-auto aspect-[3/4] w-full max-w-md rounded-lg" />
          ) : parsedLyric ? (
            <div 
              className="overflow-auto rounded-lg transition-transform duration-200"
              style={{ transform: `scale(${previewScale})`, transformOrigin: 'top center' }}
            >
              <LyricCanvas ref={canvasRef} />
            </div>
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