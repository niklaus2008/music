/**
 * @fileoverview 模板与编辑器相关类型定义
 */

/** 输出比例预设 */
export type AspectRatio = '1:1' | '3:4' | '9:16';

/** 文字对齐方式 */
export type TextAlign = 'left' | 'center' | 'justify';

/** 排版方向 */
export type LayoutDirection = 'horizontal' | 'vertical';

/** 内容模式 */
export type ContentMode = 'full' | 'quote';

/** 背景类型 */
export type BackgroundType = 'gradient' | 'solid' | 'image';

/** 背景配置 */
export interface BackgroundConfig {
  type: BackgroundType;
  /** gradient: CSS 渐变值; solid: 颜色值; image: URL */
  value: string;
}

/** 排版样式 */
export interface TypographyConfig {
  /** 标题字体 CSS font-family */
  titleFont: string;
  /** 正文字体 CSS font-family */
  bodyFont: string;
  /** 正文字号 (px) */
  fontSize: number;
  /** 行高倍数 */
  lineHeight: number;
  /** 字间距 (em) */
  letterSpacing: number;
  /** 对齐方式 */
  textAlign: TextAlign;
  /** 文字颜色 */
  color: string;
  /** 副标题/信息文字颜色 */
  metaColor: string;
}

/** 布局配置 */
export interface LayoutConfig {
  /** 内边距 [上, 右, 下, 左] (px) */
  padding: [number, number, number, number];
  /** 排版方向 */
  direction: LayoutDirection;
}

/** 版权条样式 */
export interface CopyrightConfig {
  /** 字号 (px) */
  fontSize: number;
  /** 颜色 */
  color: string;
  /** 分隔线是否显示 */
  showDivider: boolean;
}

/** 完整模板定义 */
export interface Template {
  /** 模板唯一 ID */
  id: string;
  /** 模板名称 */
  name: string;
  /** 缩略图路径（public 下） */
  preview: string;
  /** 背景 */
  background: BackgroundConfig;
  /** 排版 */
  typography: TypographyConfig;
  /** 布局 */
  layout: LayoutConfig;
  /** 版权条 */
  copyright: CopyrightConfig;
}

/** 各比例对应的画布基准尺寸 (px) */
export const CANVAS_SIZE: Record<AspectRatio, { width: number; height: number }> = {
  '1:1': { width: 1080, height: 1080 },
  '3:4': { width: 1080, height: 1440 },
  '9:16': { width: 1080, height: 1920 },
};
