/**
 * @fileoverview 字体配置
 * 定义可用的开源免费商用字体列表，供模板和编辑器选择。
 * 字体通过 Google Fonts CDN 加载（思源系列、霞鹜系列等均已上架）。
 */

/** 单个字体定义 */
export interface FontDef {
  /** 字体展示名称 */
  label: string;
  /** CSS font-family 值 */
  family: string;
  /** Google Fonts 加载名称（用于动态 link 标签） */
  googleName: string;
  /** 字体风格标签 */
  style: 'sans' | 'serif' | 'handwriting' | 'display';
}

/** 可用字体列表 */
export const FONTS: FontDef[] = [
  {
    label: '思源黑体',
    family: '"Noto Sans SC", sans-serif',
    googleName: 'Noto+Sans+SC',
    style: 'sans',
  },
  {
    label: '思源宋体',
    family: '"Noto Serif SC", serif',
    googleName: 'Noto+Serif+SC',
    style: 'serif',
  },
  {
    label: '霞鹜文楷',
    family: '"LXGW WenKai", cursive',
    googleName: 'LXGW+WenKai',
    style: 'handwriting',
  },
  {
    label: '霞鹜文楷 Mono',
    family: '"LXGW WenKai Mono", monospace',
    googleName: 'LXGW+WenKai+Mono',
    style: 'handwriting',
  },
  {
    label: 'Ma Shan Zheng',
    family: '"Ma Shan Zheng", cursive',
    googleName: 'Ma+Shan+Zheng',
    style: 'handwriting',
  },
  {
    label: 'Zhi Mang Xing',
    family: '"Zhi Mang Xing", cursive',
    googleName: 'Zhi+Mang+Xing',
    style: 'display',
  },
];

/**
 * 生成 Google Fonts 的 CSS 链接
 * @returns {string} 包含所有字体的 Google Fonts URL
 */
export function getGoogleFontsUrl(): string {
  const families = FONTS.map(
    (f) => `family=${f.googleName}:wght@400;700`
  ).join('&');
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}
