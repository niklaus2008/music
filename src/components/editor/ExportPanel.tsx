'use client';

/**
 * @fileoverview 导出操作区
 * 免费下载（低清 + 水印）与高清下载（3× 像素、无水印）
 */

import { useState, type RefObject } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportLyricImage } from '@/lib/export';
import { useSongStore } from '@/store/song-store';
import { useEditorStore } from '@/store/editor-store';

interface ExportPanelProps {
  /** 指向画布导出根节点（固定像素尺寸） */
  canvasRef: RefObject<HTMLDivElement | null>;
}

/**
 * 导出面板：免费 / 高清下载
 * @param {ExportPanelProps} props - 组件属性
 */
export function ExportPanel({ canvasRef }: ExportPanelProps) {
  const { currentSong, parsedLyric } = useSongStore();
  const { aspectRatio, a4Layout } = useEditorStore();
  const [busy, setBusy] = useState(false);

  /**
   * 生成安全文件名
   * @param {'hd' | undefined} variant - `hd` 时用于高清文件
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
        useEditorStore.getState().setA4Layout({ activePage: -1 });
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      await exportLyricImage(node, safeFileName(), 'free', aspectRatio, a4Layout, parsedLyric?.lines.length);
    } catch (e) {
      console.error(e);
      alert('导出失败，请重试或检查浏览器是否拦截下载');
    } finally {
      if (aspectRatio === 'A4') {
        useEditorStore.getState().setA4Layout({ activePage: 0 });
      }
      setBusy(false);
    }
  };

  /**
   * 执行高清无水印导出（自动触发）
   */
  const handleHD = async () => {
    const node = canvasRef.current;
    if (!node || !currentSong) return;
    setBusy(true);
    try {
      // A4 多页模式：导出前先显示所有歌词行，导出完成后再恢复
      if (aspectRatio === 'A4' && parsedLyric && parsedLyric.lines.length > a4Layout.linesPerPage) {
        useEditorStore.getState().setA4Layout({ activePage: -1 });
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      await exportLyricImage(node, safeFileName('hd'), 'paid', aspectRatio, a4Layout, parsedLyric?.lines.length);
    } catch (e) {
      console.error(e);
      alert('高清导出失败，请重试或检查浏览器是否拦截下载');
    } finally {
      if (aspectRatio === 'A4') {
        useEditorStore.getState().setA4Layout({ activePage: 0 });
      }
      setBusy(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <Button
          type="button"
          size="lg"
          className="w-full gap-2"
          disabled={busy || !currentSong}
          onClick={handleFree}
        >
          <Download className="h-4 w-4" />
          {aspectRatio === 'A4'
            ? '免费下载（带水印，A4 多页为 ZIP）'
            : '免费下载（带水印）'}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="w-full"
          disabled={busy || !currentSong}
          onClick={() => void handleHD()}
        >
          {busy ? '导出中…' : '高清下载（无水印）'}
        </Button>
      </div>
      {aspectRatio === 'A4' && (
        <p className="text-xs text-muted-foreground">
          A4 比例下，歌词超过单页高度会自动分页；多页时一键下载 ZIP（每页一张 PNG）。
        </p>
      )}
    </>
  );
}
