/**
 * @fileoverview 图片导出引擎
 * 使用 html-to-image 将画布 DOM 节点转换为高清位图。
 * 画布逻辑尺寸见 `src/types/template.ts` 中的 `CANVAS_SIZE`；本模块用 `pixelRatio` 与倍率表控制导出清晰度。
 * 免费版：1× 像素密度 + 水印；付费版：3× 像素密度 + 无水印。
 */

import { toPng } from 'html-to-image';
import { drawWatermark } from './watermark';

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

  const dataUrl = await toPng(node, {
    pixelRatio: scale,
    cacheBust: true,
    skipAutoScale: true,
    /** 优先嵌入 woff2，减少跨域字体抓取失败 */
    preferredFontFormat: 'woff2',
    fetchRequestInit: {
      mode: 'cors',
      credentials: 'omit',
    },
  });

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
