/**
 * @fileoverview 歌词方卡模板
 * 特征：1:1方形，浅色背景，适合打印/朋友圈
 */

import type { Template } from '@/types/template';

export const squareTemplate: Template = {
  id: 'square',
  name: '歌词方卡',
  preview: '/templates/square.png',
  background: {
    type: 'gradient',
    value: 'linear-gradient(160deg, #faf9f7 0%, #e8e6e1 100%)',
  },
  typography: {
    titleFont: '"Noto Sans SC", sans-serif',
    bodyFont: '"Noto Sans SC", sans-serif',
    fontSize: 24,
    lineHeight: 1.9,
    letterSpacing: 0.04,
    textAlign: 'center',
    color: '#333333',
    metaColor: '#888888',
  },
  layout: {
    padding: [50, 40, 50, 40],
    direction: 'horizontal',
  },
  copyright: {
    fontSize: 10,
    color: '#aaaaaa',
    showDivider: false,
  },
};