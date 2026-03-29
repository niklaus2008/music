/**
 * @fileoverview 编辑器状态管理
 * 管理当前模板、输出比例、内容模式、选中的金句行等编辑器参数。
 */

import { create } from 'zustand';
import type { Template, AspectRatio, ContentMode } from '@/types/template';
import { templates } from '@/lib/templates';

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

  setTemplate: (t: Template) => void;
  setAspectRatio: (r: AspectRatio) => void;
  setContentMode: (m: ContentMode) => void;
  toggleLine: (index: number) => void;
  selectAllLines: (indices: number[]) => void;
  clearLines: () => void;
  setActiveFont: (font: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  template: templates[0],
  aspectRatio: '3:4',
  contentMode: 'full',
  selectedLines: new Set<number>(),
  activeFont: templates[0].typography.bodyFont,

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
}));
