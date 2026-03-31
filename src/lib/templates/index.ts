/**
 * @fileoverview 模板注册表与字体定义
 * 统一导出所有内置模板、可用字体列表。
 */

import type { Template } from '@/types/template';
import { xiaohongshuTemplate } from './xiaohongshu';
import { japaneseTemplate } from './japanese';
import { chineseClassicTemplate } from './chinese-classic';
import { pinkTemplate } from './pink';

/** 所有内置模板（顺序即为 UI 中的展示顺序） */
export const templates: Template[] = [
  xiaohongshuTemplate,
  japaneseTemplate,
  chineseClassicTemplate,
  pinkTemplate,
];

/** 字体定义：id → CSS font-family + 展示名 */
export interface FontOption {
  id: string;
  label: string;
  family: string;
}

/** 可选字体列表 */
export const fontOptions: FontOption[] = [
  { id: 'noto-sans', label: '思源黑体', family: '"Noto Sans SC", sans-serif' },
  { id: 'smiley-sans', label: '得意黑', family: '"SmileySans", sans-serif' },
  { id: 'lxgw-wenkai', label: '霞鹜文楷', family: '"LXGW WenKai", serif' },
  { id: 'noto-serif', label: '思源宋体', family: '"Noto Serif SC", serif' },
];
