/**
 * @fileoverview 编辑器状态管理
 * 管理当前模板、输出比例、内容模式、选中的金句行等编辑器参数。
 */

import { create } from 'zustand';
import type { Template, AspectRatio, ContentMode } from '@/types/template';
import { templates } from '@/lib/templates';

/** A4 排版选项 */
export interface A4LayoutOptions {
  /** 每页行数 */
  linesPerPage: 30 | 40 | 50 | 60;
  /** 排版方向 */
  direction: 'horizontal' | 'vertical';
  /** 边距大小 (px) */
  margin: number;
  /** 显示页眉 */
  showHeader: boolean;
  /** 显示页脚 */
  showFooter: boolean;
  /** 当前预览的 A4 页码 */
  activePage: number;
}

interface EditorState {
  /** 当前模板 */
  template: Template;
  /** 输出比例 */
  aspectRatio: AspectRatio;
  /** 内容模式：全文 / 金句 */
  contentMode: ContentMode;
  /** 金句模式下选中的歌词行索引 */
  selectedLines: Set<number>;
  /** 当前选中的正文字体 */
  activeFont: string;
  /** 正文字号 */
  fontSize: number;
  /** A4 排版选项 */
  a4Layout: A4LayoutOptions;

  setTemplate: (t: Template) => void;
  setAspectRatio: (r: AspectRatio) => void;
  setContentMode: (m: ContentMode) => void;
  toggleLine: (index: number) => void;
  selectAllLines: (indices: number[]) => void;
  clearLines: () => void;
  setActiveFont: (font: string) => void;
  setFontSize: (size: number) => void;
  setA4Layout: (options: Partial<A4LayoutOptions>) => void;
}

const defaultA4Layout: A4LayoutOptions = {
  linesPerPage: 40,
  direction: 'horizontal',
  margin: 80,
  showHeader: true,
  showFooter: true,
  activePage: 0,
};

export const useEditorStore = create<EditorState>((set) => ({
  template: templates[0],
  aspectRatio: '3:4',
  contentMode: 'full',
  selectedLines: new Set<number>(),
  activeFont: templates[0].typography.bodyFont,
  fontSize: templates[0].typography.fontSize,
  a4Layout: defaultA4Layout,

  setTemplate: (t) =>
    set({ template: t, activeFont: t.typography.bodyFont }),

  setAspectRatio: (r) => set({ aspectRatio: r }),

  setContentMode: (m) => set({ contentMode: m }),

  toggleLine: (index) =>
    set((state) => {
      const next = new Set(state.selectedLines);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return { selectedLines: next };
    }),

  selectAllLines: (indices) =>
    set({ selectedLines: new Set(indices) }),

  clearLines: () => set({ selectedLines: new Set() }),

  setActiveFont: (font) => set({ activeFont: font }),
  setFontSize: (size) => set({ fontSize: size }),
  setA4Layout: (options) =>
    set((state) => ({ a4Layout: { ...state.a4Layout, ...options } })),
}));
