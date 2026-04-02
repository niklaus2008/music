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
  /**
   * 自定义背景图 URL：`blob:`（本地上传）或站内路径如 `/backgrounds/xxx.png`；非空时覆盖模板背景
   * @remarks 仅对 `blob:` 调用 `revokeObjectURL`，站内静态路径由 `setCustomBackgroundUrl` 管理
   */
  customBackgroundUrl: string | null;
  /**
   * 歌词/标题主色；`null` 表示使用当前模板 `typography.color`
   */
  lyricColor: string | null;
  /**
   * 副标题、说明、分隔等辅色；`null` 表示使用模板 `typography.metaColor`
   */
  metaColor: string | null;

  setTemplate: (t: Template) => void;
  setAspectRatio: (r: AspectRatio) => void;
  setContentMode: (m: ContentMode) => void;
  toggleLine: (index: number) => void;
  selectAllLines: (indices: number[]) => void;
  clearLines: () => void;
  setActiveFont: (font: string) => void;
  setFontSize: (size: number) => void;
  setA4Layout: (options: Partial<A4LayoutOptions>) => void;
  /**
   * 设置自定义背景：传入本地图片文件或 `null` 清除并恢复模板背景
   * @param {File | null} file - 图片文件；`null` 表示移除
   */
  setCustomBackgroundFromFile: (file: File | null) => void;
  /**
   * 设置自定义背景为站内绝对路径或外链 URL；`null` 清除背景
   * @param {string | null} url - 如 `/backgrounds/preset-01.png`
   */
  setCustomBackgroundUrl: (url: string | null) => void;
  /**
   * 设置歌词主色；`null` 恢复为模板默认
   * @param {string | null} color - CSS 颜色字符串
   */
  setLyricColor: (color: string | null) => void;
  /**
   * 设置辅色；`null` 恢复为模板默认
   * @param {string | null} color - CSS 颜色字符串
   */
  setMetaColor: (color: string | null) => void;
}

/**
 * 若为 blob URL 则释放，避免泄漏；站内路径不调用 revoke
 * @param {string | null | undefined} url - 当前背景地址
 */
function revokeIfBlob(url: string | null | undefined) {
  if (url?.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      /* 忽略无效 URL */
    }
  }
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
  customBackgroundUrl: null,
  lyricColor: null,
  metaColor: null,

  setTemplate: (t) =>
    set({
      template: t,
      activeFont: t.typography.bodyFont,
      lyricColor: null,
      metaColor: null,
    }),

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

  setCustomBackgroundFromFile: (file) => {
    set((state) => {
      revokeIfBlob(state.customBackgroundUrl);
      if (!file) {
        return { customBackgroundUrl: null };
      }
      return { customBackgroundUrl: URL.createObjectURL(file) };
    });
  },

  setCustomBackgroundUrl: (url) => {
    set((state) => {
      revokeIfBlob(state.customBackgroundUrl);
      return { customBackgroundUrl: url };
    });
  },

  setLyricColor: (color) => set({ lyricColor: color }),

  setMetaColor: (color) => set({ metaColor: color }),
}));
