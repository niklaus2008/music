/**
 * @fileoverview 日系手写风模板
 * 特征：米白纸张质感、手写楷体、淡色调、左对齐、透气行距
 */

import type { Template } from '@/types/template';

export const japaneseTemplate: Template = {
  id: 'japanese',
  name: '日系手写',
  preview: '/templates/japanese.png',
  background: {
    type: 'solid',
    value: '#faf8f5',
  },
  typography: {
    titleFont: '"LXGW WenKai", serif',
    bodyFont: '"LXGW WenKai", serif',
    fontSize: 26,
    lineHeight: 2.2,
    letterSpacing: 0.08,
    textAlign: 'left',
    color: '#3d3d3d',
    metaColor: '#a0978e',
  },
  layout: {
    padding: [90, 64, 90, 64],
    direction: 'horizontal',
  },
  copyright: {
    fontSize: 13,
    color: '#c4bdb4',
    showDivider: false,
  },
};
