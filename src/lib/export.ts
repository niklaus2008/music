/**
 * @fileoverview 图片导出引擎
 * 使用 html-to-image 将画布 DOM 节点转换为高清位图。
 * 画布逻辑尺寸见 `src/types/template.ts` 中的 `CANVAS_SIZE`；本模块用 `pixelRatio` 与倍率表控制导出清晰度。
 * A4 比例下按歌词块高度分页，多页时打包为 ZIP 一键下载。
 * 免费版：1× 像素密度 + 水印；付费版：3× 像素密度 + 无水印。
 */

import { toPng } from 'html-to-image';
import type { AspectRatio } from '@/types/template';
import { CANVAS_SIZE } from '@/types/template';
import { drawWatermark, drawDiagonalWatermark } from './watermark';
import { zipBlobsStore, type ZipStoreEntry } from './zip-store';
import type { A4LayoutOptions } from '@/store/editor-store';

/** 导出质量等级 */
export type ExportTier = 'free' | 'paid';

/**
 * 各等级的像素倍率（相对画布基准 CSS 像素）。
 * 与 `CANVAS_SIZE` 相乘得到最终位图边长（近似）。
 */
const SCALE_MAP: Record<ExportTier, number> = {
  free: 1,
  paid: 3,
};

const SEL_EXPORT_LINE = '[data-export-line]';
const SEL_EXPORT_HEADER = '[data-export-header]';
const SEL_EXPORT_BODY = '[data-export-body]';
const SEL_EXPORT_FOOTER = '[data-export-footer]';
/** 手账本双页容器（见 `LyricCanvas`） */
const SEL_SCRAPBOOK_ROOT = '[data-scrapbook-root]';
/** 手账本左页歌词列 */
const SEL_SCRAPBOOK_LYRIC_COL = '[data-scrapbook-lyric-column]';

/**
 * 手账本为 absolute 子树，不占文档流；根节点 `height:auto` 时 scrollHeight 近乎只剩 padding，导出成细条。
 * 导出前暂改为流式布局并展开左栏滚动，使 scrollHeight 含完整歌词。
 * @param {HTMLElement} root - 画布根节点
 * @returns {{ el: HTMLElement; cssText: string }[]} 用于 `restoreScrapbookExportDom`
 */
function prepareScrapbookExportDom(
  root: HTMLElement
): { el: HTMLElement; cssText: string }[] {
  const scrapRoot = root.querySelector<HTMLElement>(SEL_SCRAPBOOK_ROOT);
  const lyricCol = root.querySelector<HTMLElement>(SEL_SCRAPBOOK_LYRIC_COL);
  if (!scrapRoot || !lyricCol) return [];

  const backups: { el: HTMLElement; cssText: string }[] = [
    { el: scrapRoot, cssText: scrapRoot.style.cssText },
    { el: lyricCol, cssText: lyricCol.style.cssText },
  ];

  scrapRoot.style.position = 'relative';
  scrapRoot.style.inset = 'auto';
  scrapRoot.style.top = 'auto';
  scrapRoot.style.left = 'auto';
  scrapRoot.style.right = 'auto';
  scrapRoot.style.bottom = 'auto';
  scrapRoot.style.width = '100%';
  scrapRoot.style.height = 'auto';

  lyricCol.style.overflow = 'visible';
  lyricCol.style.height = 'auto';
  lyricCol.style.maxHeight = 'none';
  lyricCol.style.minHeight = 'auto';

  return backups;
}

/**
 * 恢复手账本导出前改动的内联样式
 * @param backups - `prepareScrapbookExportDom` 的返回值
 */
function restoreScrapbookExportDom(
  backups: { el: HTMLElement; cssText: string }[]
): void {
  for (const { el, cssText } of backups) {
    el.style.cssText = cssText;
  }
}

/**
 * 导出时暂存的样式，用于恢复 DOM
 */
interface ExportStyleBackup {
  /** 根画布 style.cssText */
  rootCssText: string;
  /** 正文区 style.cssText */
  bodyCssText: string;
  /** 每行原始 display */
  lineDisplays: Map<HTMLElement, string>;
}

/**
 * 备份导出相关节点的内联样式
 * @param {HTMLElement} root - 画布根节点（与 `exportImage` 的 node 相同）
 * @returns {ExportStyleBackup} 备份
 */
function backupExportStyles(root: HTMLElement): ExportStyleBackup {
  const lineDisplays = new Map<HTMLElement, string>();
  root.querySelectorAll<HTMLElement>(SEL_EXPORT_LINE).forEach((el) => {
    lineDisplays.set(el, el.style.display);
  });
  const body = root.querySelector<HTMLElement>(SEL_EXPORT_BODY);
  return {
    rootCssText: root.style.cssText,
    bodyCssText: body?.style.cssText ?? '',
    lineDisplays,
  };
}

/**
 * 恢复导出前的内联样式
 * @param {HTMLElement} root - 画布根节点
 * @param {ExportStyleBackup} backup - 备份
 */
function restoreExportStyles(root: HTMLElement, backup: ExportStyleBackup): void {
  root.style.cssText = backup.rootCssText;
  const body = root.querySelector<HTMLElement>(SEL_EXPORT_BODY);
  if (body) {
    body.style.cssText = backup.bodyCssText;
  }
  backup.lineDisplays.forEach((display, el) => {
    el.style.display = display;
  });
}

/**
 * 测量块级行占用高度（含上下 margin）
 * @param {HTMLElement} el - 歌词行节点
 * @returns {number} 高度（px）
 */
function measureBlockHeight(el: HTMLElement): number {
  const rect = el.getBoundingClientRect();
  const cs = window.getComputedStyle(el);
  const mt = parseFloat(cs.marginTop) || 0;
  const mb = parseFloat(cs.marginBottom) || 0;
  return rect.height + mt + mb;
}

/**
 * 按 A4 单页可用正文高度，将歌词行索引划分为多页
 * @param {HTMLElement} root - 画布根节点
 * @param {number} pageHeightPx - A4 逻辑高度（与 CANVAS_SIZE.A4.height 一致）
 * @param {number} linesPerPage - 每页行数
 * @returns {Set<number>[]} 每页应显示的行索引集合（与 `data-line-index` 对应）
 */
function buildA4PageIndexSets(
  root: HTMLElement,
  pageHeightPx: number,
  linesPerPage: number = 40
): Set<number>[] {
  const header = root.querySelector<HTMLElement>(SEL_EXPORT_HEADER);
  const footer = root.querySelector<HTMLElement>(SEL_EXPORT_FOOTER);
  const bodyEl = root.querySelector<HTMLElement>(SEL_EXPORT_BODY);
  const rcs = window.getComputedStyle(root);
  const pt = parseFloat(rcs.paddingTop) || 0;
  const pb = parseFloat(rcs.paddingBottom) || 0;
  const innerH = pageHeightPx - pt - pb;
  const hh = header?.offsetHeight ?? 0;
  const hf = footer?.offsetHeight ?? 0;
  let bodyPadY = 0;
  if (bodyEl) {
    const bcs = window.getComputedStyle(bodyEl);
    bodyPadY =
      (parseFloat(bcs.paddingTop) || 0) +
      (parseFloat(bcs.paddingBottom) || 0);
  }
  const avail = Math.max(80, innerH - hh - hf - bodyPadY);
  
  console.log('[buildA4PageIndexSets] avail:', avail);

  const lineEls = Array.from(
    root.querySelectorAll<HTMLElement>(SEL_EXPORT_LINE)
  );
  
  if (lineEls.length === 0) {
    return [];
  }
  
  // 根据用户选择的每页行数计算分页
  const totalPages = Math.ceil(lineEls.length / linesPerPage);
  
  console.log('[buildA4PageIndexSets] totalLines:', lineEls.length, 'linesPerPage:', linesPerPage, 'totalPages:', totalPages);
  
  const pages: Set<number>[] = [];
  for (let page = 0; page < totalPages; page++) {
    const pageSet = new Set<number>();
    const startIdx = page * linesPerPage;
    const endIdx = Math.min(startIdx + linesPerPage, lineEls.length);
    
    for (let i = startIdx; i < endIdx; i++) {
      const el = lineEls[i];
      const idx = parseInt(el.dataset.lineIndex ?? '-1', 10);
      pageSet.add(idx);
    }
    pages.push(pageSet);
  }
  
  console.log('[buildA4PageIndexSets] FINAL pages:', pages.length);
  return pages;
}

/**
 * 仅显示指定页包含的歌词行（null 表示全部显示）
 * @param {HTMLElement} root - 画布根
 * @param {Set<number> | null} shown - 本页可见的行索引，null 为不筛选
 */
function applyA4LineVisibility(
  root: HTMLElement,
  shown: Set<number> | null
): void {
  console.log('[applyA4LineVisibility] called with shown:', shown);
  const allEls = root.querySelectorAll<HTMLElement>('[data-line-index]');
  console.log('[applyA4LineVisibility] total elements found:', allEls.length);
  
  allEls.forEach((el) => {
    const idx = parseInt(el.dataset.lineIndex ?? '-1', 10);
    if (shown === null) {
      el.style.display = '';
      console.log('[applyA4LineVisibility] showing all, reset index:', idx);
    } else {
      const shouldShow = shown.has(idx);
      el.style.display = shouldShow ? '' : 'none';
      if (shouldShow) console.log('[applyA4LineVisibility] showing index:', idx);
    }
  });
}

/**
 * 固定 A4 单页布局并展开正文，便于截图
 * @param {HTMLElement} root - 画布根
 * @param {number} cw - 宽度
 * @param {number} ch - 高度
 */
function prepareA4CaptureLayout(
  root: HTMLElement,
  cw: number,
  ch: number
): void {
  root.style.width = `${cw}px`;
  root.style.height = `${ch}px`;
  root.style.minHeight = `${ch}px`;
  root.style.overflow = 'hidden';
  const body = root.querySelector<HTMLElement>(SEL_EXPORT_BODY);
  if (body) {
    body.style.overflow = 'visible';
    body.style.maxHeight = 'none';
  }
}

/**
 * 截取当前布局下的 A4 一帧为 PNG data URL
 * @param {HTMLElement} node - 画布根
 * @param {ExportTier} tier - 等级
 * @param {number} cw - 宽
 * @param {number} ch - 高
 * @returns {Promise<string>} data URL
 */
async function captureA4Frame(
  node: HTMLElement,
  tier: ExportTier,
  cw: number,
  ch: number,
  pageIndex: number = 0
): Promise<string> {
  const scale = SCALE_MAP[tier];
  
  // 记录当前可见行数
  const visibleLines = node.querySelectorAll('[data-line-index]').length;
  console.log('[captureA4Frame] page', pageIndex + 1, 'visible lines before capture:', visibleLines);
  
  await new Promise((r) => setTimeout(r, 40));
  
  // 捕获前确保容器高度正确
  const containerHeight = node.offsetHeight;
  console.log('[captureA4Frame] container height:', containerHeight);
  
  const result = await toPng(node, {
    pixelRatio: scale,
    cacheBust: true,
    skipAutoScale: true,
    width: cw,
    height: ch,
    style: {
      overflow: 'hidden',
      height: `${ch}px`,
      width: `${cw}px`,
    },
    preferredFontFormat: 'woff2',
    // 禁用远程字体
    filter: (node) => {
      if (node instanceof HTMLLinkElement && node.href?.includes('fonts.googleapis')) {
        return false;
      }
      return true;
    },
  });
  
  console.log('[captureA4Frame] captured image size:', result.length, 'bytes');
  return result;
}

/**
 * 免费档叠加水印
 * @param {string} dataUrl - 原始 PNG data URL
 * @param {ExportTier} tier - 等级
 * @returns {Promise<string>} 处理后的 data URL
 */
async function applyWatermarkIfFree(
  dataUrl: string,
  tier: ExportTier
): Promise<string> {
  if (tier === 'paid') {
    return dataUrl;
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D 不可用'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        
        // 右下角品牌水印
        drawWatermark(canvas, {
          fontSize: Math.round(img.width * 0.016),
          offsetX: Math.round(img.width * 0.025),
          offsetY: Math.round(img.height * 0.02),
        });
        
        // 斜条防裁水印
        drawDiagonalWatermark(canvas);
        
        resolve(canvas.toDataURL('image/png'));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error('水印合成失败'));
    img.src = dataUrl;
  });
}

/**
 * data URL 转 Blob
 * @param {string} dataUrl - data URL
 * @returns {Promise<Blob>} Blob
 */
async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

/**
 * 触发浏览器下载（Blob）
 * @param {Blob} blob - 文件内容
 * @param {string} fileName - 文件名
 */
function triggerDownloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = fileName;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * 将指定 DOM 节点导出为 PNG 图片并触发下载
 * @param {HTMLElement} node - 画布 DOM 节点
 * @param {string} fileName - 下载文件名
 * @param {ExportTier} tier - 导出等级
 */
export async function exportImage(
  node: HTMLElement,
  fileName: string,
  tier: ExportTier = 'free'
): Promise<void> {
  const scale = SCALE_MAP[tier];

  const originalStyle = node.getAttribute('style') || '';

  node.style.height = 'auto';
  node.style.overflow = 'visible';

  const scrapbookBackups = prepareScrapbookExportDom(node);

  let dataUrl: string | undefined;

  try {
    await new Promise((resolve) => setTimeout(resolve, 50));
    if (scrapbookBackups.length > 0) {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      });
    }

    const contentWidth = node.scrollWidth;
    const contentHeight = node.scrollHeight;

    dataUrl = await toPng(node, {
      pixelRatio: scale,
      cacheBust: true,
      skipAutoScale: true,
      width: contentWidth,
      height: contentHeight,
      style: {
        overflow: 'visible',
        height: 'auto',
      },
      preferredFontFormat: 'woff2',
      filter: (n) => {
        if (n instanceof HTMLLinkElement && n.href?.includes('fonts.googleapis')) {
          return false;
        }
        return true;
      },
    });
  } finally {
    restoreScrapbookExportDom(scrapbookBackups);
    node.setAttribute('style', originalStyle);
  }

  if (!dataUrl) {
    throw new Error('导出截图失败');
  }

  if (tier === 'free') {
    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas 2D 不可用'));
            return;
          }
          ctx.drawImage(img, 0, 0);
          drawWatermark(canvas, {
            fontSize: Math.round(img.width * 0.016),
            offsetX: Math.round(img.width * 0.025),
            offsetY: Math.round(img.height * 0.02),
          });
          drawDiagonalWatermark(canvas);
          triggerDownload(canvas.toDataURL('image/png'), fileName);
          resolve();
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => reject(new Error('水印合成失败'));
      img.src = dataUrl;
    });
  } else {
    triggerDownload(dataUrl, fileName);
  }
}

/**
 * 按当前比例导出歌词图：非 A4 走整图导出；A4 超页时多页 ZIP，单页仍为单张 PNG。
 * @param {HTMLElement} node - 画布根节点
 * @param {string} fileName - 单图时的文件名（须含 .png）；ZIP 时取其主文件名
 * @param {ExportTier} tier - 导出等级
 * @param {AspectRatio} aspectRatio - 当前输出比例
 * @param {A4LayoutOptions} a4Layout - A4 排版选项
 */
export async function exportLyricImage(
  node: HTMLElement,
  fileName: string,
  tier: ExportTier,
  aspectRatio: AspectRatio,
  a4Layout?: A4LayoutOptions,
  totalLyricLines?: number
): Promise<void> {
  console.log('[exportLyricImage] START aspectRatio:', aspectRatio, 'fileName:', fileName);
  
  if (aspectRatio !== 'A4') {
    console.log('[exportLyricImage] not A4, using exportImage');
    await exportImage(node, fileName, tier);
    return;
  }

  const { width: cw, height: ch } = CANVAS_SIZE.A4;
  console.log('[exportLyricImage] A4 size:', cw, ch);
  const stem = fileName.replace(/\.png$/i, '');
  const backup = backupExportStyles(node);
  
  // 获取每页行数配置
  const linesPerPage = a4Layout?.linesPerPage ?? 40;
  console.log('[exportLyricImage] linesPerPage:', linesPerPage);

  // 使用传入的歌词总行数
  const totalLines = totalLyricLines ?? node.querySelectorAll('[data-line-index]').length;
  console.log('[exportLyricImage] totalLines:', totalLines);

  // 计算总页数（与预览保持一致）
  const totalPages = totalLines > 0 ? Math.ceil(totalLines / linesPerPage) : 1;
  console.log('[exportLyricImage] totalPages:', totalPages);

  // 如果总页数 <= 1，直接导出单张图片
  if (totalPages <= 1) {
    console.log('[exportLyricImage] single page, single image');
    prepareA4CaptureLayout(node, cw, ch);
    applyA4LineVisibility(node, null);
    const raw = await captureA4Frame(node, tier, cw, ch, 0);
    const out = await applyWatermarkIfFree(raw, tier);
    triggerDownload(out, fileName);
    restoreExportStyles(node, backup);
    return;
  }

  // 多页：打包 ZIP
  console.log('[exportLyricImage] >>> MULTI-PAGE, creating ZIP with', totalPages, 'pages');
  
  prepareA4CaptureLayout(node, cw, ch);
  
  const zipEntries: ZipStoreEntry[] = [];
  for (let i = 0; i < totalPages; i++) {
    console.log('[exportLyricImage] capturing page', i + 1);
    
    // 计算当前页的行索引范围
    const startIdx = i * linesPerPage;
    const endIdx = Math.min(startIdx + linesPerPage, totalLines);
    
    // 创建当前页的行索引 Set
    const pageSet = new Set<number>();
    for (let idx = startIdx; idx < endIdx; idx++) {
      pageSet.add(idx);
    }
    
    console.log('[exportLyricImage] page', i + 1, 'showing indices:', startIdx, 'to', endIdx - 1);
    applyA4LineVisibility(node, pageSet);
    
    // 等待 DOM 更新
    await new Promise((r) => setTimeout(r, 200));
    
    const raw = await captureA4Frame(node, tier, cw, ch, i);
    const out = await applyWatermarkIfFree(raw, tier);
    zipEntries.push({
      name: `${stem}-第${String(i + 1).padStart(2, '0')}页.png`,
      blob: await dataUrlToBlob(out),
    });
  }

  console.log('[exportLyricImage] ZIP entries prepared, generating...');
  const zipBlob = await zipBlobsStore(zipEntries);
  console.log('[exportLyricImage] ZIP generated, triggering download:', `${stem}-a4.zip`);
  triggerDownloadBlob(zipBlob, `${stem}-a4.zip`);
  
  restoreExportStyles(node, backup);
  console.log('[exportLyricImage] DONE');
}

/**
 * 触发浏览器下载
 * @param {string} dataUrl - data URL
 * @param {string} fileName - 文件名
 */
function triggerDownload(dataUrl: string, fileName: string): void {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  link.click();
}
