'use client';

/**
 * @fileoverview 导出操作区
 * 免费下载（低清 + 水印）与高清下载入口（支付接入前为说明弹窗）。
 */

import { useState, type RefObject } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { exportLyricImage } from '@/lib/export';
import { useSongStore } from '@/store/song-store';
import { useEditorStore } from '@/store/editor-store';

interface ExportPanelProps {
  /** 指向画布导出根节点（固定像素尺寸） */
  canvasRef: RefObject<HTMLDivElement | null>;
}

/**
 * 是否为开发环境（构建时内联，用于试跑付费档导出）
 */
const IS_DEV = process.env.NODE_ENV === 'development';

/**
 * 导出面板：免费 / 高清下载
 * @param {ExportPanelProps} props - 组件属性
 */
export function ExportPanel({ canvasRef }: ExportPanelProps) {
  const { currentSong, parsedLyric } = useSongStore();
  const { aspectRatio, a4Layout } = useEditorStore();
  const [busy, setBusy] = useState(false);
  const [paidDialogOpen, setPaidDialogOpen] = useState(false);

  /**
   * 生成安全文件名
   * @param {'hd' | undefined} variant - `hd` 时用于区分试跑高清文件
   */
  const safeFileName = (variant?: 'hd') => {
    const base = currentSong?.name ?? 'lyric';
    const cleaned = base.replace(/[/\\?%*:|"<>]/g, '-');
    return variant === 'hd' ? `${cleaned}-lyric-hd.png` : `${cleaned}-lyric.png`;
  };

  /**
   * 执行免费导出
   */
  const handleFree = async () => {
    const node = canvasRef.current;
    if (!node || !currentSong) return;
    setBusy(true);
    try {
      // A4 多页模式：导出前先显示所有歌词行，导出完成后再恢复
      if (aspectRatio === 'A4' && parsedLyric && parsedLyric.lines.length > a4Layout.linesPerPage) {
        // 临时设置 activePage 为 -1（显示全部）
        useEditorStore.getState().setA4Layout({ activePage: -1 });
        // 等待渲染更新
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      await exportLyricImage(node, safeFileName(), 'free', aspectRatio, a4Layout, parsedLyric?.lines.length);
    } catch (e) {
      console.error(e);
      alert('导出失败，请重试或检查浏览器是否拦截下载');
    } finally {
      // 恢复当前页
      if (aspectRatio === 'A4') {
        useEditorStore.getState().setA4Layout({ activePage: 0 });
      }
      setBusy(false);
    }
  };

  /**
   * 开发环境：试跑付费档（3× 像素、无水印），不含真实支付
   */
  const handleDevPaidExport = async () => {
    const node = canvasRef.current;
    if (!node || !currentSong) return;
    setBusy(true);
    try {
      await exportLyricImage(node, safeFileName('hd'), 'paid', aspectRatio, a4Layout, parsedLyric?.lines.length);
      setPaidDialogOpen(false);
    } catch (e) {
      console.error(e);
      alert('高清导出失败，请重试或检查浏览器是否拦截下载');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          className="flex-1 gap-2"
          disabled={busy || !currentSong}
          onClick={handleFree}
        >
          <Download className="h-4 w-4" />
          {busy
            ? '导出中…'
            : aspectRatio === 'A4'
              ? '免费下载（带水印，A4 多页为 ZIP）'
              : '免费下载（带水印）'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          disabled={!currentSong}
          onClick={() => setPaidDialogOpen(true)}
        >
          高清下载
        </Button>
      </div>
      {aspectRatio === 'A4' && (
        <p className="text-xs text-muted-foreground">
          A4 比例下，歌词超过单页高度会自动分页；多页时一键下载 ZIP（每页一张 PNG）。
        </p>
      )}

      <Dialog open={paidDialogOpen} onOpenChange={setPaidDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>高清无水印下载</DialogTitle>
            <DialogDescription>
              按次付费功能正在接入中。完成后，支付成功将自动触发高清无水印图片下载。
              当前可先使用「免费下载」预览效果。
            </DialogDescription>
          </DialogHeader>
          {IS_DEV && (
            <div className="space-y-2 border-t border-border/60 pt-4">
              <p className="text-xs text-muted-foreground">
                开发模式：可试跑付费档导出（约 3× 像素密度、无水印），文件名带{' '}
                <code className="rounded bg-muted px-1 py-0.5 text-[0.7rem]">
                  -lyric-hd
                </code>
                。
              </p>
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                disabled={busy || !currentSong}
                onClick={() => void handleDevPaidExport()}
              >
                {busy ? '导出中…' : '试跑高清导出（开发）'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
