/**
 * @fileoverview 手账本风格模板
 * 特征：双页设计、米白纸张、户外草地、手写歌词、播放器UI
 */

import type { Template } from '@/types/template';

export const scrapbookTemplate: Template = {
  id: 'scrapbook',
  name: '手账本',
  preview: '/templates/scrapbook.png',
  background: {
    type: 'gradient',
    // 米白纸张质感 + 草地户外背景
    value: 'linear-gradient(to bottom, rgba(245,240,230,0.95), rgba(230,225,210,0.95)), url(https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800)',
  },
  typography: {
    titleFont: '"Noto Sans SC", sans-serif',
    bodyFont: '"ZCOOL KuaiLe", "Noto Sans SC", sans-serif',
    fontSize: 20,
    lineHeight: 2.2,
    letterSpacing: 0.1,
    textAlign: 'left',
    color: '#2c3e50',
    metaColor: '#5d6d7e',
  },
  layout: {
    padding: [40, 40, 40, 40],
    direction: 'horizontal',
  },
  copyright: {
    fontSize: 10,
    color: '#a0a0a0',
    showDivider: false,
  },
};