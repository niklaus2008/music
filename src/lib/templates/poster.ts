/**
 * @fileoverview 歌名海报模板
 * 特征：9:16竖版，可自定义背景图，像专辑封面设计
 */

import type { Template } from '@/types/template';

export const posterTemplate: Template = {
  id: 'poster',
  name: '歌名海报',
  preview: '/templates/poster.png',
  background: {
    type: 'gradient',
    value: 'linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 60%, #0a0a0a 100%)',
  },
  typography: {
    titleFont: '"SmileySans", "Noto Sans SC", sans-serif',
    bodyFont: '"Noto Sans SC", sans-serif',
    fontSize: 36,
    lineHeight: 1.5,
    letterSpacing: 0.1,
    textAlign: 'center',
    color: '#ffffff',
    metaColor: '#888888',
  },
  layout: {
    padding: [100, 40, 80, 40],
    direction: 'horizontal',
  },
  copyright: {
    fontSize: 10,
    color: '#555555',
    showDivider: false,
  },
};