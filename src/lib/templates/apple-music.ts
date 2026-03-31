/**
 * @fileoverview Apple Music / QQ音乐截图风模板
 * 特征：黑色背景，白色歌词大字，还原音乐APP界面
 */

import type { Template } from '@/types/template';

export const appleMusicTemplate: Template = {
  id: 'apple-music',
  name: 'APP风格',
  preview: '/templates/apple-music.png',
  background: {
    type: 'gradient',
    value: 'linear-gradient(180deg, #1a1a1a 0%, #000000 100%)',
  },
  typography: {
    titleFont: '"SmileySans", "Noto Sans SC", sans-serif',
    bodyFont: '"Noto Sans SC", sans-serif',
    fontSize: 32,
    lineHeight: 1.8,
    letterSpacing: 0.02,
    textAlign: 'center',
    color: '#ffffff',
    metaColor: '#8e8e93',
  },
  layout: {
    padding: [60, 40, 80, 40],
    direction: 'horizontal',
  },
  copyright: {
    fontSize: 12,
    color: '#636366',
    showDivider: false,
  },
};