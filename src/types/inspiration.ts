/**
 * @fileoverview 歌词广场静态示例条目类型（仅展示用）
 */

import type { AspectRatio, ContentMode } from '@/types/template';

/**
 * 单条展示示例（与 `src/data/inspiration.json` 对齐）
 */
export interface InspirationItem {
  /** 列表内唯一 id */
  id: string;
  /** 卡片标题 */
  title: string;
  /** 可选副标题或说明 */
  description?: string;
  /** 列表缩略图 URL（建议与 previewUrl 同图不同尺寸或同一图） */
  coverUrl: string;
  /** 弹窗预览大图 URL */
  previewUrl: string;
  /**
   * 可选：预留字段（如曾用于跳转编辑器）；当前广场仅展示，可不填
   */
  songId?: string;
  /** 对应内置模板 id，缺省为 `xiaohongshu` */
  templateId?: string;
  /** 输出比例，缺省为 `3:4` */
  aspectRatio?: AspectRatio;
  /** 全文 / 金句，缺省为 `quote`（有 songId 时）或 `full` */
  contentMode?: ContentMode;
  /**
   * 金句模式下选中的歌词行 index（与解析后 `LyricLine.index` 一致）
   */
  selectedLineIndices?: number[];
}

/**
 * 静态 JSON 根结构
 */
export interface InspirationData {
  items: InspirationItem[];
}
