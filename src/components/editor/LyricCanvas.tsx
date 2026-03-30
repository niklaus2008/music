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
  useEffect,
} from 'react';
import { CANVAS_SIZE } from '@/types/template';
import { useSongStore } from '@/store/song-store';
import { useEditorStore } from '@/store/editor-store';

export const LyricCanvas = forwardRef<HTMLDivElement, object>(
  function LyricCanvas(_, ref) {
    const { currentSong, parsedLyric } = useSongStore();
    const {
      template,
      aspectRatio,
      contentMode,
      selectedLines,
      activeFont,
      a4Layout,
    } = useEditorStore();

    const containerRef = useRef<HTMLDivElement>(null);
    const { width: cw, height: ch } = CANVAS_SIZE[aspectRatio];
    const [previewScale, setPreviewScale] = useState(1);
    const [activePage, setActivePage] = useState<number>(0);
    const isA4 = aspectRatio === 'A4';

    // 计算 A4 分页
    const totalLines = parsedLyric?.lines.length ?? 0;
    const linesPerPage = a4Layout.linesPerPage;
    const totalPages = isA4 && totalLines > 0 ? Math.ceil(totalLines / linesPerPage) : 1;

    // A4 多页模式下始终显示所有行，通过 CSS 控制显示/隐藏
    const isA4MultiPage = isA4 && totalPages > 1;

    // 根据是否 A4 多页模式确定显示的歌词行
    const displayLines = useMemo(() => {
      if (!parsedLyric) return [];
      // A4 多页模式下显示所有行
      if (isA4MultiPage) {
        if (contentMode === 'quote') {
          const picked = parsedLyric.lines.filter(
            (l) => !l.isBreak && selectedLines.has(l.index)
          );
          return picked.sort((a, b) => a.index - b.index);
        }
        return parsedLyric.lines;
      }
      // 非 A4 多页模式：使用原来的 bodyLines 逻辑
      if (contentMode === 'quote') {
        const picked = parsedLyric.lines.filter(
          (l) => !l.isBreak && selectedLines.has(l.index)
        );
        return picked.sort((a, b) => a.index - b.index);
      }
      return parsedLyric.lines;
    }, [parsedLyric, isA4MultiPage, contentMode, selectedLines]);

    useLayoutEffect(() => {
      const el = containerRef.current;
      if (!el) return;

      const update = () => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        if (w <= 0 || h <= 0) return;
        
        if (isA4) {
          // A4 模式：根据宽度等比缩放，确保完整显示
          const scaleX = (w - 4) / cw;
          const scaleY = h / ch;
          setPreviewScale(Math.min(scaleX, scaleY, 1));
        } else {
          setPreviewScale(Math.min(1, (w - 4) / cw));
        }
      };

      update();
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => ro.disconnect();
    }, [cw, ch, isA4]);

    // 监听页码切换事件
    useEffect(() => {
      const handler = (e: CustomEvent<{ page: number }>) => {
        setActivePage(e.detail.page);
      };
      window.addEventListener('a4-page-change', handler as EventListener);
      return () => window.removeEventListener('a4-page-change', handler as EventListener);
    }, []);

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
    const isVertical = template.layout.direction === 'vertical';

    /** 横排正文通用样式 */
    const horizontalBodyStyle: CSSProperties = {
      fontFamily: activeFont,
      fontSize: template.typography.fontSize,
      lineHeight: template.typography.lineHeight,
      letterSpacing: `${template.typography.letterSpacing}em`,
      color: template.typography.color,
      textAlign,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    };

    if (!currentSong || !parsedLyric) {
      return (
        <div className="flex min-h-[280px] w-full items-center justify-center rounded-xl border border-dashed bg-muted/30 text-sm text-muted-foreground">
          暂无歌曲数据
        </div>
      );
    }

    const emptyQuote =
      contentMode === 'quote' && displayLines.length === 0;

    /** 竖排容器主轴对齐（flex-row-reverse 下） */
    const verticalJustify: CSSProperties['justifyContent'] =
      textAlign === 'center'
        ? 'center'
        : textAlign === 'right'
          ? 'flex-start'
          : 'flex-end';

    return (
      <div ref={containerRef} className={isA4 ? "w-full h-full overflow-auto" : "w-full max-w-full overflow-hidden"}>
      <div
        className="mx-auto flex justify-center"
        style={{
          height: isA4 ? 'auto' : ch * previewScale,
        }}
      >
        <div
          style={{
            width: cw,
            height: isA4 ? 'auto' : ch,
            transform: isA4 ? `scale(${previewScale})` : `scale(${previewScale})`,
            transformOrigin: 'top center',
          }}
        >
          <div
            ref={ref}
            className="box-border flex flex-col rounded-sm shadow-sm overflow-y-auto"
            style={{
              width: cw,
              height: isA4 ? 'auto' : ch,
              minHeight: isA4 ? ch : undefined,
              ...bgStyle,
              padding: `${pt}px ${pr}px ${pb}px ${pl}px`,
            }}
          >
            <header className="shrink-0 space-y-2" data-export-header>
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

            <div
              className="min-h-0 flex-1 overflow-y-auto pt-6 scrollbar-thin"
              data-export-body
            >
              {emptyQuote ? (
                <div
                  className="flex h-full min-h-[200px] items-center justify-center px-6 text-center opacity-70"
                  style={{
                    fontFamily: activeFont,
                    fontSize: template.typography.fontSize - 2,
                    color: template.typography.metaColor,
                    writingMode: isVertical ? 'horizontal-tb' : undefined,
                  }}
                >
                  金句模式：请在左侧勾选要展示的歌词行
                </div>
              ) : isVertical ? (
                <div
                  className="flex h-full max-h-full flex-row-reverse flex-wrap content-start items-start justify-center gap-x-3 gap-y-1 overflow-y-auto scrollbar-thin"
                  style={{
                    fontFamily: activeFont,
                    fontSize: template.typography.fontSize,
                    color: template.typography.color,
                  }}
                >
                  {displayLines.map((line) =>
                    line.isBreak ? (
                      <div
                        key={`brk-${line.index}`}
                        className="h-4 w-full shrink-0 basis-full"
                        aria-hidden
                        data-export-line
                        data-line-index={line.index}
                      />
                    ) : (
                      <div
                        key={line.index}
                        className="max-h-full shrink-0"
                        data-export-line
                        data-line-index={line.index}
                        style={{
                          writingMode: 'vertical-rl',
                          textOrientation: 'mixed',
                          lineHeight: template.typography.lineHeight,
                          letterSpacing: `${template.typography.letterSpacing}em`,
                        }}
                      >
                        {line.text}
                      </div>
                    )
                  )}
                </div>
              ) : contentMode === 'full' ? (
                <div className="space-y-0" style={horizontalBodyStyle}>
                  {displayLines.map((line) =>
                    line.isBreak ? (
                      <div
                        key={`brk-${line.index}`}
                        className="h-4"
                        data-export-line
                        data-line-index={line.index}
                      />
                    ) : (
                      <p
                        key={line.index}
                        className="m-0"
                        data-export-line
                        data-line-index={line.index}
                      >
                        {line.text}
                      </p>
                    )
                  )}
                </div>
              ) : (
                <div className="space-y-3" style={horizontalBodyStyle}>
                  {displayLines.map((line) => (
                    <p
                      key={line.index}
                      className="m-0"
                      data-export-line
                      data-line-index={line.index}
                    >
                      {line.text}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <footer className="mt-auto shrink-0 space-y-2 pt-8" data-export-footer>
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
              <p
                className="opacity-75"
                style={{
                  fontFamily: activeFont,
                  fontSize: Math.max(10, template.copyright.fontSize - 2),
                  color: template.copyright.color,
                  textAlign,
                  lineHeight: 1.45,
                }}
              >
                歌词仅供个人学习与非商业使用 · 数据检索来源：网易云音乐
              </p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
});
