/**
 * @fileoverview 水印工具
 * 在导出的图片 Canvas 上绘制品牌水印。
 */

/** 水印配置 */
interface WatermarkOptions {
  /** 水印文字 */
  text?: string;
  /** 字号 (px) */
  fontSize?: number;
  /** 颜色（含透明度） */
  color?: string;
  /** 与右下角的偏移 */
  offsetX?: number;
  offsetY?: number;
}

const DEFAULTS: Required<WatermarkOptions> = {
  text: 'LyricCanvas',
  fontSize: 16,
  color: 'rgba(0, 0, 0, 0.15)',
  offsetX: 24,
  offsetY: 24,
};

/**
 * 在已有的 HTMLCanvasElement 右下角绘制水印
 * @param {HTMLCanvasElement} canvas - 目标 canvas
 * @param {WatermarkOptions} [opts] - 可选配置
 */
export function drawWatermark(
  canvas: HTMLCanvasElement,
  opts?: WatermarkOptions
): void {
  const cfg = { ...DEFAULTS, ...opts };
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.save();
  ctx.font = `${cfg.fontSize}px "Noto Sans SC", sans-serif`;
  ctx.fillStyle = cfg.color;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText(cfg.text, canvas.width - cfg.offsetX, canvas.height - cfg.offsetY);
  ctx.restore();
}
