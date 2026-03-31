/**
 * @fileoverview 简约高级风模板
 * 特征：莫兰迪色系背景，艺术字体，大留白，高级感
 */

import type { Template } from '@/types/template';

export const minimalistTemplate: Template = {
  id: 'minimalist',
  name: '简约高级',
  preview: '/templates/minimalist.png',
  background: {
    type: 'gradient',
    value: 'linear-gradient(145deg, #c9d6c3 0%, #a8b5a3 100%)',
  },
  typography: {
    titleFont: '"Noto Serif SC", serif',
    bodyFont: '"Noto Serif SC", serif',
    fontSize: 26,
    lineHeight: 2,
    letterSpacing: 0.12,
    textAlign: 'center',
    color: '#3d3d3d',
    metaColor: '#7a7a6e',
  },
  layout: {
    padding: [80, 60, 80, 60],
    direction: 'horizontal',
  },
  copyright: {
    fontSize: 12,
    color: '#9a9a8e',
    showDivider: false,
  },
};