/**
 * @fileoverview 小红书风格模板
 * 特征：温暖渐变背景、现代无衬线字体、圆角卡片感、居中排列
 */

import type { Template } from '@/types/template';

export const xiaohongshuTemplate: Template = {
  id: 'xiaohongshu',
  name: '小红书',
  preview: '/templates/xiaohongshu.png',
  background: {
    type: 'gradient',
    value: 'linear-gradient(145deg, #fdfcfb 0%, #e2d1c3 100%)',
  },
  typography: {
    titleFont: '"SmileySans", "Noto Sans SC", sans-serif',
    bodyFont: '"Noto Sans SC", sans-serif',
    fontSize: 28,
    lineHeight: 2,
    letterSpacing: 0.05,
    textAlign: 'center',
    color: '#2c2c2c',
    metaColor: '#8a7e74',
  },
  layout: {
    padding: [80, 60, 80, 60],
    direction: 'horizontal',
  },
  copyright: {
    fontSize: 14,
    color: '#b8a99a',
    showDivider: true,
  },
};
