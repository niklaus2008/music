/**
 * @fileoverview 中国风模板
 * 水墨元素感、宋体/楷体、沉稳深色、竖排韵味。
 */

import type { Template } from '@/types/template';

export const chineseClassicTemplate: Template = {
  id: 'chinese-classic',
  name: '中国风',
  preview: '/templates/chinese-classic.png',
  background: {
    type: 'gradient',
    value: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  },
  typography: {
    titleFont: '"LXGW WenKai", cursive',
    bodyFont: '"Noto Serif SC", serif',
    fontSize: 26,
    lineHeight: 2.4,
    letterSpacing: 0.12,
    textAlign: 'center',
    color: '#e8d5b7',
    metaColor: '#8a7a5e',
  },
  layout: {
    padding: [100, 70, 100, 70],
    /** 竖排：从右至左逐列展示歌词 */
    direction: 'vertical',
  },
  copyright: {
    fontSize: 11,
    color: '#6b5d45',
    showDivider: true,
  },
};
