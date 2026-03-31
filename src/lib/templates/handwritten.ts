/**
 * @fileoverview 手写歌词卡模板
 * 特征：米白色背景，手写字体，手绘装饰感
 */

import type { Template } from '@/types/template';

export const handwrittenTemplate: Template = {
  id: 'handwritten',
  name: '手写歌词',
  preview: '/templates/handwritten.png',
  background: {
    type: 'gradient',
    value: 'linear-gradient(160deg, #fdf8f3 0%, #f5e6d8 100%)',
  },
  typography: {
    titleFont: '"ZCOOL KuaiLe", "Noto Sans SC", sans-serif',
    bodyFont: '"ZCOOL KuaiLe", "Noto Sans SC", sans-serif',
    fontSize: 28,
    lineHeight: 2.2,
    letterSpacing: 0.08,
    textAlign: 'center',
    color: '#4a4a4a',
    metaColor: '#9a8b7a',
  },
  layout: {
    padding: [60, 50, 60, 50],
    direction: 'horizontal',
  },
  copyright: {
    fontSize: 12,
    color: '#c4b8a8',
    showDivider: false,
  },
};