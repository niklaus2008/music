'use client';

/**
 * @fileoverview 歌词预览画布
 * 固定像素尺寸（与导出一致），外层通过 transform 缩放适配屏幕。
 */

import type { CSSProperties } from 'react';
import {
  forwardRef,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CANVAS_SIZE } from '@/types/template';
import { useSongStore } from '@/store/song-store';
import { useEditorStore } from '@/store/editor-store';

export const LyricCanvas = forwardRef<HTMLDivElement, Record<string, never>>(
  function LyricCanvas(_, ref) {
      const {
      template,
      aspectRatio,
      contentMode,
      selectedLines,
      activeFont,
    } = useEditorStore();

    const containerRef = useRef<HTMLDivElement>(null);
    const { width: cw, height: ch } = CANVAS_SIZE[aspectRatio];
    const [previewScale, setPreviewScale] = useState(1);

    useLayoutEffect(() => {
      const el = containerRef.current;
      if (!el) return;

      const update = () => {
        const w = el.clientWidth;
        if (w <= 0) return;
        setPreviewScale(Math.min(1, (w - 4) / cw));
      };

      update();
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    }, [cw]);

    const metaLine = useMemo(() => {
      if (!currentSong) return '';
      const artists = currentSong.artists.map((a) => a.name).join(' / ');
      const album = currentSong.album.name;
      return `${artists}${album ? ` · ${album}` : ''}`;
    }, [currentSong]);

    const bodyLines = useMemo(() => {
      if (!parsedLyric) return [];
      const lines = parsedLyric.lines;
      if (contentMode === 'full') return lines;

      const picked = lines.filter(
        (l) => !l.isBreak && selectedLines.has(l.index)
      );
      return picked.sort((a, b) => a.index - b.index);
    }, [parsedLyric, contentMode, selectedLines]);

    const [pt, pr, pb, pl] = template.layout.padding;
    const bgStyle: CSSProperties =
      template.background.type === 'gradient'
        ? { backgroundImage: template.background.value }
        : template.background.type === 'image'
          ? {
              backgroundImage: `url(${template.background.value})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : { backgroundColor: template.background.value };

    const titleFont = template.typography.titleFont;
    const textAlign = template.typography.textAlign;

    if (!currentSong || !parsedLyric) {
      return (
        <div className="flex min-h-[280px] w-full items-center justify-center rounded-xl border border-dashed bg-muted/30 text-sm text-muted-foreground">
          暂无歌曲数据
        </div>
      );
    }

    const emptyQuote =
      contentMode === 'quote' && bodyLines.length === 0;

    return (
    <div ref={containerRef} className="w-full max-w-full overflow-hidden">
      <div
        className="mx-auto flex justify-center"
        style={{
          height: ch * previewScale,
        }}
      >
        <div
          style={{
            width: cw,
            height: ch,
            transform: `scale(${previewScale})`,
            transformOrigin: 'top center',
          }}
        >
          <div
            ref={ref}
            className="box-border flex flex-col overflow-hidden rounded-sm shadow-sm"
            style={{
              width: cw,
              height: ch,
              ...bgStyle,
              padding: `${pt}px ${pr}px ${pb}px ${pl}px`,
            }}
          >
            <header className="shrink-0 space-y-2">
              <h2
                className="font-semibold leading-tight"
                style={{
                  fontFamily: titleFont,
                  fontSize: template.typography.fontSize + 8,
                  color: template.typography.color,
                  textAlign,
                }}
              >
                {currentSong.name}
              </h2>
              <p
                className="leading-relaxed opacity-90"
                style={{
                  fontFamily: activeFont,
                  fontSize: Math.round(template.typography.fontSize * 0.55),
                  color: template.typography.metaColor,
                  textAlign,
                }}
              >
                {metaLine}
              </p>
              {template.copyright.showDivider && (
                <div
                  className="mx-auto h-px w-12 opacity-40"
                  style={{ backgroundColor: template.typography.metaColor }}
                />
              )}
            </header>

            <div className="min-h-0 flex-1 overflow-hidden pt-6">
              {emptyQuote ? (
                <div
                  className="flex h-full items-center justify-center px-6 text-center opacity-70"
                  style={{
                    fontFamily: activeFont,
                    fontSize: template.typography.fontSize - 2,
                    color: template.typography.metaColor,
                  }}
                >
                  金句模式：请在左侧勾选要展示的歌词行
                </div>
              ) : contentMode === 'full' ? (
                <div
                  className="space-y-0"
                  style={{
                    fontFamily: activeFont,
                    fontSize: template.typography.fontSize,
                    lineHeight: template.typography.lineHeight,
                    letterSpacing: `${template.typography.letterSpacing}em`,
                    color: template.typography.color,
                    textAlign,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {bodyLines.map((line) =>
                    line.isBreak ? (
                      <div key={`brk-${line.index}`} className="h-4" />
                    ) : (
                      <p key={line.index} className="m-0">
                        {line.text}
                      </p>
                    )
                  )}
                </div>
              ) : (
                <div
                  className="space-y-3"
                  style={{
                    fontFamily: activeFont,
                    fontSize: template.typography.fontSize,
                    lineHeight: template.typography.lineHeight,
                    letterSpacing: `${template.typography.letterSpacing}em`,
                    color: template.typography.color,
                    textAlign,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {bodyLines.map((line) => (
                    <p key={line.index} className="m-0">
                      {line.text}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <footer className="mt-auto shrink-0 pt-8">
              <p
                className="opacity-90"
                style={{
                  fontFamily: activeFont,
                  fontSize: template.copyright.fontSize,
                  color: template.copyright.color,
                  textAlign,
                }}
              >
                《{currentSong.name}》 · {currentSong.artists.map((a) => a.name).join(' / ')}
                {currentSong.album.name ? ` · ${currentSong.album.name}` : ''}
              </p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
});
