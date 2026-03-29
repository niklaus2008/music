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
import { exportImage } from '@/lib/export';
import { useSongStore } from '@/store/song-store';

interface ExportPanelProps {
  /** 指向画布导出根节点（固定像素尺寸） */
  canvasRef: RefObject<HTMLDivElement | null>;
}

/**
 * 导出面板：免费 / 高清下载
 * @param {ExportPanelProps} props - 组件属性
 */
export function ExportPanel({ canvasRef }: ExportPanelProps) {
  const { currentSong } = useSongStore();
  const [busy, setBusy] = useState(false);
  const [paidDialogOpen, setPaidDialogOpen] = useState(false);

  /**
   * 生成安全文件名
   */
  const safeFileName = () => {
    const base = currentSong?.name ?? 'lyric';
    const cleaned = base.replace(/[/\\?%*:|"<>]/g, '-');
    return `${cleaned}-lyric.png`;
  };

  /**
   * 执行免费导出
   */
  const handleFree = async () => {
    const node = canvasRef.current;
    if (!node || !currentSong) return;
    setBusy(true);
    try {
      await exportImage(node, safeFileName(), 'free');
    } catch (e) {
      console.error(e);
      alert('导出失败，请重试或检查浏览器是否拦截下载');
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
          {busy ? '导出中…' : '免费下载（带水印）'}
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

      <Dialog open={paidDialogOpen} onOpenChange={setPaidDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>高清无水印下载</DialogTitle>
            <DialogDescription>
              按次付费功能正在接入中。完成后，支付成功将自动触发高清无水印图片下载。
              当前可先使用「免费下载」预览效果。
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
