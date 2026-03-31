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
  fontSize: 18,
  color: 'rgba(0, 0, 0, 0.5)',
  offsetX: 30,
  offsetY: 30,
};

/** 随机古诗词 */
const POEMS = [
  '天涯若比邻',
  '海上生明月',
  '但愿人长久',
  '千里共婵娟',
  '相逢是首歌',
  '岁月如歌',
  '歌以咏志',
  '余音绕梁',
  '曲终人散',
  '高山流水',
  '阳春白雪',
  '下里巴人',
  '此情可待成追忆',
  '只是当时已惘然',
  '人生若只如初见',
  '何事秋风悲画扇',
];

/**
 * 绘制右下角品牌水印
 */
export function drawWatermark(
  canvas: HTMLCanvasElement,
  opts?: WatermarkOptions
): void {
  const cfg = { ...DEFAULTS, ...opts };
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.save();
  ctx.font = `600 ${cfg.fontSize}px "Noto Sans SC", sans-serif`;
  ctx.fillStyle = cfg.color;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText(cfg.text, canvas.width - cfg.offsetX, canvas.height - cfg.offsetY);
  ctx.restore();
}

/**
 * 绘制斜条水印（保护更强）
 * @param canvas 目标 canvas
 * @param text 可选自定义文字，默认随机古诗词
 */
export function drawDiagonalWatermark(
  canvas: HTMLCanvasElement,
  text?: string
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 随机选择一句古诗词
  const poem = text || POEMS[Math.floor(Math.random() * POEMS.length)];
  
  // 检测背景明暗
  const sampleData = ctx.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;
  const brightness = (sampleData[0] + sampleData[1] + sampleData[2]) / 3;
  const isDark = brightness < 128;
  
  const fillColor = isDark 
    ? 'rgba(255, 255, 255, 0.25)' 
    : 'rgba(0, 0, 0, 0.25)';
  
  const strokeColor = isDark
    ? 'rgba(0, 0, 0, 0.15)'
    : 'rgba(255, 255, 255, 0.15)';

  const fontSize = Math.max(14, Math.round(canvas.width * 0.018));
  
  ctx.save();
  ctx.font = `500 ${fontSize}px "Noto Sans SC", sans-serif`;
  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1.5;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 计算斜线角度和重复次数
  const diagonal = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);
  const angle = Math.atan2(canvas.height, canvas.width);
  const spacing = fontSize * 4;
  
  ctx.rotate(-angle);
  
  // 绘制斜条水印
  for (let y = -diagonal; y < diagonal * 2; y += spacing) {
    for (let x = -diagonal; x < diagonal * 2; x += spacing) {
      ctx.strokeText(poem, x, y);
      ctx.fillText(poem, x, y);
    }
  }
  
  ctx.restore();
}