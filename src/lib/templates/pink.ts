/**
 * @fileoverview 粉红花瓣风格模板
 * 特征：粉色渐变背景、简洁中文字体、左侧留白右侧文字
 */

import type { Template } from '@/types/template';

export const pinkTemplate: Template = {
  id: 'pink',
  name: '粉红',
  preview: '/templates/pink.png',
  background: {
    type: 'gradient',
    value: 'linear-gradient(180deg, #fef6f7 0%, #fbe4e8 100%)',
  },
  typography: {
    titleFont: '"Noto Sans SC", sans-serif',
    bodyFont: '"Noto Sans SC", sans-serif',
    fontSize: 26,
    lineHeight: 1.8,
    letterSpacing: 0.08,
    textAlign: 'left',
    color: '#3d3d3d',
    metaColor: '#b08d9a',
  },
  layout: {
    padding: [60, 80, 60, 100],
    direction: 'horizontal',
  },
  copyright: {
    fontSize: 12,
    color: '#c9a8b1',
    showDivider: false,
  },
};