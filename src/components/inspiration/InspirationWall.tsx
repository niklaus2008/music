'use client';

/**
 * @fileoverview 灵感墙：静态 JSON 驱动的卡片栅格 + 预览弹窗 +「做同款」
 */

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import inspirationData from '@/data/inspiration.json';
import type { InspirationItem } from '@/types/inspiration';
import { applyInspirationPreset } from '@/lib/apply-inspiration-preset';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const ITEMS = inspirationData.items as InspirationItem[];

/**
 * 灵感卡片墙与预览交互
 */
export function InspirationWall({ className }: { className?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<InspirationItem | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPreview = (item: InspirationItem) => {
    setError(null);
    setActive(item);
    setOpen(true);
  };

  /**
   * 应用预设并进入编辑器
   */
  const handleMakeSame = async () => {
    if (!active) return;
    setBusy(true);
    setError(null);
    const result = await applyInspirationPreset(active);
    setBusy(false);
    if (result.ok) {
      setOpen(false);
      router.push('/editor');
      return;
    }
    setError(result.error);
  };

  return (
    <div className={cn('w-full', className)}>
      <p className="mb-4 text-center text-sm text-muted-foreground">
        精选示例，点击卡片先预览大图；支持「做同款」的条目将带上模板与歌词。
      </p>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {ITEMS.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => openPreview(item)}
              className="group w-full overflow-hidden rounded-xl border bg-card text-left shadow-sm transition hover:border-primary/30 hover:shadow-md"
            >
              <div className="relative aspect-[3/4] w-full bg-muted">
                <Image
                  src={item.coverUrl}
                  alt={item.title}
                  fill
                  className="object-cover transition group-hover:scale-[1.02]"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
              </div>
              <div className="p-2.5 sm:p-3">
                <p className="line-clamp-2 text-sm font-medium leading-snug">
                  {item.title}
                </p>
                {item.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </div>
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg gap-0 overflow-hidden p-0 sm:max-w-xl">
          {active && (
            <>
              <div className="relative aspect-[3/4] w-full max-h-[min(70vh,560px)] bg-muted">
                <Image
                  src={active.previewUrl}
                  alt={active.title}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>
              <div className="space-y-2 border-t bg-background px-4 py-3">
                <DialogHeader className="space-y-1 text-left">
                  <DialogTitle className="text-base">{active.title}</DialogTitle>
                  {active.description && (
                    <DialogDescription>{active.description}</DialogDescription>
                  )}
                </DialogHeader>
                {error && (
                  <p className="text-sm text-destructive" role="alert">
                    {error}
                  </p>
                )}
                <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    关闭
                  </Button>
                  <Button
                    type="button"
                    disabled={!active.songId || busy}
                    onClick={handleMakeSame}
                  >
                    {busy ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        准备中…
                      </>
                    ) : (
                      '做同款'
                    )}
                  </Button>
                </DialogFooter>
                {!active.songId && (
                  <p className="text-xs text-muted-foreground">
                    此条为纯展示，请前往首页搜索歌曲后在编辑器中选择模板创作。
                  </p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
