'use client';

/**
 * @fileoverview 歌词广场：官方示例（JSON）+ 本地上传图展示；大图预览为全屏 Dialog
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent, MouseEvent } from 'react';
import Image from 'next/image';
import { Trash2, Upload } from 'lucide-react';
import inspirationData from '@/data/inspiration.json';
import type { InspirationItem } from '@/types/inspiration';
import {
  addPlazaUserImage,
  loadPlazaUserImages,
  PLAZA_USER_IMAGE_MAX_COUNT,
  PLAZA_USER_IMAGE_MAX_EDGE,
  removePlazaUserImage,
  type PlazaUserImage,
} from '@/lib/plaza-user-images';
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
 * 弹窗预览统一结构
 */
interface ActivePreview {
  src: string;
  title: string;
  description?: string;
  /** 为 true 时用原生 img（data URL），否则用 next/image */
  isDataUrl: boolean;
}

/**
 * 歌词广场卡片墙与预览
 */
export function InspirationWall({ className }: { className?: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [userImages, setUserImages] = useState<PlazaUserImage[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<ActivePreview | null>(null);

  useEffect(() => {
    setUserImages(loadPlazaUserImages());
  }, []);

  const refreshUserImages = useCallback(() => {
    setUserImages(loadPlazaUserImages());
  }, []);

  const openPreviewStatic = (item: InspirationItem) => {
    setActive({
      src: item.previewUrl,
      title: item.title,
      description: item.description,
      isDataUrl: false,
    });
    setOpen(true);
  };

  const openPreviewUser = (img: PlazaUserImage) => {
    setActive({
      src: img.dataUrl,
      title: img.name,
      isDataUrl: true,
    });
    setOpen(true);
  };

  /**
   * 处理本地上传
   */
  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    const result = await addPlazaUserImage(file);
    setUploading(false);
    if (result.ok) {
      refreshUserImages();
    } else {
      setUploadError(result.error);
    }
  };

  /**
   * 删除已上传的一张图
   */
  const handleRemoveUser = (e: MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    removePlazaUserImage(id);
    refreshUserImages();
  };

  return (
    <div className={cn('w-full', className)}>
      <p className="mb-4 text-center text-sm text-muted-foreground">
        精选示例与本地图片；上传内容仅保存在当前浏览器。
      </p>

      <div className="mb-5 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[10px] text-muted-foreground">
          支持 JPG / PNG / WebP 等常见格式；单张过长边会压缩至约 {PLAZA_USER_IMAGE_MAX_EDGE}px
          以节省空间。本地最多保留 {PLAZA_USER_IMAGE_MAX_COUNT} 张，超出后自动移除最先上传的一张。
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFile}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5" />
            {uploading ? '处理中…' : '上传图片'}
          </Button>
        </div>
      </div>
      {uploadError ? (
        <p className="mb-3 text-center text-sm text-destructive" role="alert">
          {uploadError}
        </p>
      ) : null}

      {userImages.length > 0 ? (
        <div className="mb-6">
          <h3 className="mb-2 text-xs font-medium text-muted-foreground">我的上传</h3>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {userImages.map((img) => (
              <li key={img.id} className="relative">
                <button
                  type="button"
                  onClick={() => openPreviewUser(img)}
                  className="group w-full overflow-hidden rounded-xl border bg-card text-left shadow-sm transition hover:border-primary/30 hover:shadow-md"
                >
                  <div className="relative aspect-[3/4] w-full bg-muted">
                    <Image
                      src={img.dataUrl}
                      alt={img.name}
                      fill
                      unoptimized
                      className="object-cover transition group-hover:scale-[1.02]"
                      sizes="(max-width: 640px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-2.5 sm:p-3">
                    <p className="line-clamp-2 text-sm font-medium leading-snug">{img.name}</p>
                  </div>
                </button>
                <button
                  type="button"
                  title="删除"
                  onClick={(e) => handleRemoveUser(e, img.id)}
                  className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 text-muted-foreground shadow-sm ring-1 ring-border transition hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <h3 className="mb-2 text-xs font-medium text-muted-foreground">精选示例</h3>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {ITEMS.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => openPreviewStatic(item)}
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
                <p className="line-clamp-2 text-sm font-medium leading-snug">{item.title}</p>
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
        <DialogContent
          showCloseButton
          closeButtonClassName="top-[max(0.5rem,env(safe-area-inset-top))] right-[max(0.5rem,env(safe-area-inset-right))] text-white hover:bg-white/15 hover:text-white"
          className={cn(
            'fixed inset-0 left-0 top-0 z-50 flex h-[100dvh] max-h-[100dvh] w-full max-w-none translate-x-0 translate-y-0 gap-0 rounded-none border-0 bg-background p-0 shadow-none ring-0 sm:max-w-none',
            'flex-col overflow-hidden data-open:zoom-in-100'
          )}
        >
          {active && (
            <>
              {/* 全屏大图区：黑底便于看清浅色图 */}
              <div className="relative flex min-h-0 flex-1 flex-col bg-black">
                <div className="relative min-h-0 w-full flex-1">
                  <Image
                    src={active.src}
                    alt={active.title}
                    fill
                    unoptimized={active.isDataUrl}
                    className="object-contain"
                    sizes="100vw"
                    priority
                  />
                </div>
              </div>
              <div className="shrink-0 space-y-2 border-t bg-background px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <DialogHeader className="space-y-1 text-left">
                  <DialogTitle className="text-base">{active.title}</DialogTitle>
                  {active.description ? (
                    <DialogDescription>{active.description}</DialogDescription>
                  ) : null}
                </DialogHeader>
                <DialogFooter className="m-0 rounded-none border-0 bg-transparent p-0 sm:justify-end">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    关闭
                  </Button>
                </DialogFooter>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
