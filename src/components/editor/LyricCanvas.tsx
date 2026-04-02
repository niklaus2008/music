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
      fontSize,
      a4Layout,
      customBackgroundUrl,
      lyricColor,
      metaColor,
    } = useEditorStore();

    /** 歌词/标题主色（用户覆盖或模板默认） */
    const bodyColor = lyricColor ?? template.typography.color;
    /** 副标题与说明色 */
    const metaColorResolved = metaColor ?? template.typography.metaColor;

    const containerRef = useRef<HTMLDivElement>(null);
    const { width: cw, height: ch } = CANVAS_SIZE[aspectRatio];
    const [previewScale, setPreviewScale] = useState(1);
    const isA4 = aspectRatio === 'A4';
    const activePage = a4Layout.activePage;

    // 计算 A4 分页
    const totalLines = parsedLyric?.lines.length ?? 0;
    const linesPerPage = a4Layout.linesPerPage;
    const totalPages = isA4 && totalLines > 0 ? Math.ceil(totalLines / linesPerPage) : 1;

    // A4 边距映射
    const marginSize = a4Layout.margin;
    
    // A4 多页模式
    const isA4MultiPage = isA4 && totalPages > 1;

    // 扑克牌模板特殊元素
    const isPokerTemplate = template.id === 'poker';
    // 手账本模板特殊元素
    const isScrapbookTemplate = template.id === 'scrapbook';

    // A4 多页模式：显示当前页的歌词
    const displayLines = useMemo(() => {
      if (!parsedLyric) return [];
      
      // 非 A4 多页模式按原逻辑
      if (!isA4MultiPage) {
        if (contentMode === 'quote') {
          const picked = parsedLyric.lines.filter(
            (l) => !l.isBreak && selectedLines.has(l.index)
          );
          return picked.sort((a, b) => a.index - b.index);
        }
        return parsedLyric.lines;
      }
      
      // A4 多页模式：只显示当前页的歌词（activePage = -1 表示显示全部，用于导出）
      if (isA4MultiPage && activePage >= 0) {
        const start = activePage * linesPerPage;
        const end = Math.min(start + linesPerPage, totalLines);
        const result = parsedLyric.lines.filter((_, idx) => idx >= start && idx < end);
        console.log('[LyricCanvas] displayLines for page', activePage, ':', result.length, 'lines, range:', start, '-', end - 1);
        return result;
      }
      // activePage = -1 时显示全部歌词（导出时使用）
      if (contentMode === 'quote') {
        const picked = parsedLyric.lines.filter(
          (l) => !l.isBreak && selectedLines.has(l.index)
        );
        return picked.sort((a, b) => a.index - b.index);
      }
      return parsedLyric.lines;
    }, [parsedLyric, isA4MultiPage, activePage, linesPerPage, totalLines, contentMode, selectedLines]);

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

    // 监听 A4 页码切换（来自父组件）
    useEffect(() => {
      const handler = (e: CustomEvent<{ page: number }>) => {
        useEditorStore.getState().setA4Layout({ activePage: e.detail.page });
      };
      window.addEventListener('set-a4-page', handler as EventListener);
      return () => window.removeEventListener('set-a4-page', handler as EventListener);
    }, []);

    // A4 多页模式：监听 activePage 变化，动态更新 CSS 类控制显示
    useEffect(() => {
      if (!isA4MultiPage) return;
      
      const contentEl = document.querySelector('.a4-content');
      if (!contentEl) return;
      
      // 清除之前的页码类
      contentEl.classList.remove('show-page-0', 'show-page-1', 'show-page-2', 'show-page-3', 'show-page-4');
      // 添加当前页的类
      contentEl.classList.add(`show-page-${activePage}`);
      
      console.log('[LyricCanvas] A4 page switched to:', activePage);
    }, [activePage, isA4MultiPage]);

    /** 副标题仅展示歌手，不含专辑/节目等元信息 */
    const metaLine = useMemo(() => {
      if (!currentSong) return '';
      return currentSong.artists.map((a) => a.name).join(' / ');
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

    /**
     * 手账本右页装饰句：与左页同源（当前解析歌词首句非空行），避免硬编码示例歌名；无首句时用歌名。
     */
    const scrapbookAccentLine = useMemo(() => {
      if (!parsedLyric) return currentSong?.name ?? '';
      const first = parsedLyric.lines.find((l) => !l.isBreak && l.text.trim());
      return first?.text ?? currentSong?.name ?? '';
    }, [parsedLyric, currentSong]);

    // 计算 padding：A4 模式使用边距预设，非 A4 使用模板设置
    const [pt, pr, pb, pl] = isA4 
      ? [marginSize, marginSize, marginSize, marginSize] 
      : template.layout.padding;
    /** 优先使用用户上传背景，否则使用当前模板背景 */
    const bgStyle: CSSProperties = useMemo(() => {
      if (customBackgroundUrl) {
        return {
          backgroundImage: `url(${customBackgroundUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        };
      }
      if (template.background.type === 'gradient') {
        return { backgroundImage: template.background.value };
      }
      if (template.background.type === 'image') {
        return {
          backgroundImage: `url(${template.background.value})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        };
      }
      return { backgroundColor: template.background.value };
    }, [customBackgroundUrl, template.background]);

    const titleFont = template.typography.titleFont;
    const textAlign = template.typography.textAlign;
    const isVertical = template.layout.direction === 'vertical';
    const bodyFontSize = fontSize || template.typography.fontSize;

    /** 横排正文通用样式 */
    const horizontalBodyStyle: CSSProperties = useMemo(
      () => ({
        fontFamily: activeFont,
        fontSize: bodyFontSize,
        lineHeight: template.typography.lineHeight,
        letterSpacing: `${template.typography.letterSpacing}em`,
        color: bodyColor,
        textAlign,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }),
      [
        activeFont,
        bodyFontSize,
        bodyColor,
        template.typography.lineHeight,
        template.typography.letterSpacing,
        textAlign,
      ]
    );

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
            className={`box-border flex flex-col rounded-sm shadow-sm overflow-y-auto ${isA4MultiPage ? 'a4-content' : ''} ${isScrapbookTemplate ? 'relative' : ''}`}
            style={{
              width: cw,
              height: isA4 ? 'auto' : ch,
              /** 与 CANVAS_SIZE 一致；导出时 `height:auto` 时防止 absolute 手账本导致高度塌成细条 */
              minHeight: ch,
              ...bgStyle,
              padding: `${pt}px ${pr}px ${pb}px ${pl}px`,
            }}
          >
            {/* 扑克牌模板装饰 */}
            {isPokerTemplate && (
              <div className="relative">
                <div className="absolute top-6 left-6 flex flex-col items-center" style={{ color: '#e53935' }}>
                  <span className="text-2xl font-bold">5</span>
                  <span className="text-xl">♥</span>
                </div>
                <div className="absolute top-6 right-6 flex flex-col items-center" style={{ color: '#e53935' }}>
                  <span className="text-sm font-bold">5</span>
                  <span className="text-xs">♥</span>
                </div>
              </div>
            )}

            {/* 手账本模板：双页布局 */}
            {isScrapbookTemplate && (
              <div className="absolute inset-0 flex" data-scrapbook-root>
                {/* 左页：横排手写歌词（勿用 justify-center + overflow-y：溢出时整块居中会导致 scrollTop=0 仍看不到开头几行） */}
                <div
                  className="flex h-full min-h-0 w-1/2 flex-col items-center justify-start overflow-y-auto p-6"
                  data-scrapbook-lyric-column
                >
                  <h3 className="mb-4 text-center" style={{ fontFamily: '"ZCOOL KuaiLe", cursive', fontSize: bodyFontSize + 2, color: bodyColor }}>
                    《{currentSong.name}》
                  </h3>
                  <p className="text-xs mb-6" style={{ fontFamily: activeFont, color: metaColorResolved }}>
                    {currentSong.artists.map((a) => a.name).join(' / ')}
                  </p>
                  <div className="w-full space-y-3 text-center">
                    {emptyQuote ? (
                      <p
                        className="px-2 opacity-70"
                        style={{
                          fontFamily: activeFont,
                          fontSize: bodyFontSize - 2,
                          color: metaColorResolved,
                        }}
                      >
                        金句模式：请在左侧勾选要展示的歌词行
                      </p>
                    ) : (
                      displayLines.map((line) =>
                        line.isBreak ? (
                          <div
                            key={`${currentSong.id}-brk-${line.index}`}
                            className="h-4"
                            aria-hidden
                          />
                        ) : (
                          <p
                            key={`${currentSong.id}-line-${line.index}`}
                            className="opacity-85 m-0"
                            style={{
                              fontFamily: '"ZCOOL KuaiLe", cursive',
                              fontSize: bodyFontSize - 2,
                              color: bodyColor,
                              lineHeight: 2,
                            }}
                          >
                            {line.text}
                          </p>
                        )
                      )
                    )}
                  </div>
                </div>
                {/* 分隔线 */}
                <div className="w-px my-8 opacity-30" style={{ backgroundColor: '#8b7355' }} />
                {/* 右页：画面与播放器 */}
                <div className="w-1/2 h-full p-6 flex flex-col items-center justify-center space-y-4">
                  <h3
                    className="max-w-full px-1 text-center font-medium leading-snug"
                    style={{
                      fontFamily: '"ZCOOL KuaiLe", cursive',
                      fontSize: bodyFontSize + 2,
                      color: bodyColor,
                    }}
                  >
                    {scrapbookAccentLine.length > 44
                      ? `${scrapbookAccentLine.slice(0, 44)}…`
                      : scrapbookAccentLine}
                  </h3>
                  <div className="relative w-28 h-28 rounded-full overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #2c5f7c 50%, #4a90a4 100%)', boxShadow: '0 6px 25px rgba(0,0,0,0.2), inset 0 0 30px rgba(135,206,235,0.3)' }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full" style={{ background: 'linear-gradient(180deg, #ffd700 0%, #ff9500 50%, #1a4f7a 100%)', boxShadow: '0 0 40px rgba(255,200,0,0.6)' }} />
                    </div>
                    <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 50%)' }} />
                  </div>
                  <div className="text-center space-y-1">
                    <p style={{ fontFamily: activeFont, fontSize: bodyFontSize - 4, color: bodyColor }}>{currentSong.name}</p>
                    <p style={{ fontFamily: activeFont, fontSize: bodyFontSize - 8, color: metaColorResolved }}>{currentSong.artists.map((a) => a.name).join(' / ')}</p>
                  </div>
                  <div className="w-full max-w-[140px]">
                    <div className="h-1.5 rounded-full" style={{ backgroundColor: '#d5d5d5' }}>
                      <div className="h-full w-1/3 rounded-full" style={{ backgroundColor: '#3498db' }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px]" style={{ color: '#888' }}>1:08</span>
                      <span className="text-[10px]" style={{ color: '#888' }}>4:19</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-base opacity-50">⟳</span>
                    <span className="text-base opacity-50">⏮</span>
                    <span className="text-xl">▶</span>
                    <span className="text-base opacity-50">⏭</span>
                    <span className="text-base opacity-50">☰</span>
                    <span className="text-base" style={{ color: '#e74c3c' }}>♥</span>
                    <span className="text-base opacity-50">👤</span>
                  </div>
                </div>
              </div>
            )}

            {/* 手账本已用双页布局独占歌词，避免再渲染默认头/正文/页脚导致叠字 */}
            {!isScrapbookTemplate && (
              <>
                <header className="shrink-0 space-y-2" data-export-header>
                  <h2
                    className="font-semibold leading-tight"
                    style={{
                      fontFamily: titleFont,
                      fontSize: bodyFontSize + 8,
                      color: bodyColor,
                      textAlign,
                    }}
                  >
                    {currentSong.name}
                  </h2>
                  <p
                    className="leading-relaxed opacity-90"
                    style={{
                      fontFamily: activeFont,
                      fontSize: Math.round(bodyFontSize * 0.55),
                      color: metaColorResolved,
                      textAlign,
                    }}
                  >
                    {metaLine}
                  </p>
                  {template.copyright.showDivider && (
                    <div
                      className="mx-auto h-px w-12 opacity-40"
                      style={{ backgroundColor: metaColorResolved }}
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
                        fontSize: bodyFontSize - 2,
                        color: metaColorResolved,
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
                        color: bodyColor,
                      }}
                    >
                      {displayLines.map((line) =>
                        line.isBreak ? (
                          <div
                            key={`brk-${line.index}`}
                            className={`h-4 w-full shrink-0 basis-full`}
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

                {/** 页脚已省略：仅保留标题区歌名/歌手与正文歌词，避免重复信息与免责声明占位画布 */}
                <footer className="hidden" data-export-footer aria-hidden />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
