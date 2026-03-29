'use client';

/**
 * @fileoverview 歌词排版编辑器页
 * 左侧/下方：模板与样式控制；右侧/上方：实时画布预览与导出。
 */

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { LyricCanvas } from '@/components/editor/LyricCanvas';
import { TemplateGallery } from '@/components/editor/TemplateGallery';
import { EditorStylePanel } from '@/components/editor/EditorStylePanel';
import { LyricSelector } from '@/components/editor/LyricSelector';
import { ExportPanel } from '@/components/editor/ExportPanel';
import { useSongStore } from '@/store/song-store';
import { useEditorStore } from '@/store/editor-store';

export default function EditorPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLDivElement>(null);
  const { currentSong, parsedLyric, loadingLyric } = useSongStore();
  const { contentMode } = useEditorStore();

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
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 md:flex-row md:py-10">
      {/* 控制区 */}
      <aside className="order-2 flex w-full shrink-0 flex-col gap-4 md:order-1 md:w-[min(100%,380px)]">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="-ml-2 gap-1">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              重新搜索
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">当前歌曲</CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {currentSong.name} ·{' '}
              {currentSong.artists.map((a) => a.name).join(' / ')}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                风格模板
              </p>
              <TemplateGallery />
            </div>
            <Separator />
            <EditorStylePanel />
            {contentMode === 'quote' && (
              <>
                <Separator />
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    勾选金句
                  </p>
                  {loadingLyric ? (
                    <Skeleton className="h-64 w-full rounded-lg" />
                  ) : (
                    <LyricSelector />
                  )}
                </div>
              </>
            )}
            <Separator />
            <ExportPanel canvasRef={canvasRef} />
          </CardContent>
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
            <div className="flex min-h-[240px] items-center justify-center text-sm text-muted-foreground">
              未能加载歌词
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
