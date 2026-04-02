/**
 * @fileoverview 歌词扑克牌风格模板
 * 特征：粉色渐变背景、扑克牌元素、Hello Kitty 播放器
 */

import type { Template } from '@/types/template';

export const pokerTemplate: Template = {
  id: 'poker',
  name: '歌词扑克',
  preview: '/templates/poker.png',
  background: {
    type: 'gradient',
    value: 'linear-gradient(180deg, #ffeef2 0%, #f8d0dc 100%)',
  },
  typography: {
    titleFont: '"Noto Sans SC", sans-serif',
    bodyFont: '"Noto Sans SC", sans-serif',
    fontSize: 22,
    lineHeight: 1.9,
    letterSpacing: 0.05,
    textAlign: 'center',
    color: '#3d3d3d',
    metaColor: '#b08d9a',
  },
  layout: {
    padding: [80, 60, 80, 60],
    direction: 'horizontal',
  },
  copyright: {
    fontSize: 12,
    color: '#c9a8b1',
    showDivider: false,
  },
};