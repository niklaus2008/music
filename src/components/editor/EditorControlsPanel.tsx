'use client';

/**
 * @fileoverview 编辑器控制区内容（模板、样式、歌词选择、导出）
 * 供桌面侧栏与移动端底部抽屉复用。
 */

import type { RefObject } from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TemplateGallery } from '@/components/editor/TemplateGallery';
import { EditorStylePanel } from '@/components/editor/EditorStylePanel';
import { LyricSelector } from '@/components/editor/LyricSelector';
import { ExportPanel } from '@/components/editor/ExportPanel';
import { useSongStore } from '@/store/song-store';
import { useEditorStore } from '@/store/editor-store';

export interface EditorControlsPanelProps {
  /** 画布根节点引用，供导出使用 */
  canvasRef: RefObject<HTMLDivElement | null>;
}

/**
 * 模板、比例、字体、金句与导出操作
 * @param {EditorControlsPanelProps} props - 组件属性
 */
export function EditorControlsPanel({ canvasRef }: EditorControlsPanelProps) {
  const { currentSong, parsedLyric, loadingLyric } = useSongStore();
  const { contentMode } = useEditorStore();

  return (
    <>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">当前歌曲</CardTitle>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {currentSong?.name} ·{' '}
          {currentSong?.artists.map((a) => a.name).join(' / ')}
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
        {!loadingLyric && parsedLyric && (
          <>
            <Separator />
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                {contentMode === 'quote' ? '勾选金句' : '歌词预览'}
              </p>
              <LyricSelector />
            </div>
          </>
        )}
        <Separator />
        <ExportPanel canvasRef={canvasRef} />
      </CardContent>
    </>
  );
}
