/**
 * @fileoverview 歌词相关类型定义
 */

/** 数据源返回的原始歌词 */
export interface RawLyric {
  /** 原始歌词文本（可能含 LRC 时间戳） */
  original: string;
  /** 翻译歌词文本（可选） */
  translation?: string;
}

/** 清洗后的单行歌词 */
export interface LyricLine {
  /** 行号（从 0 开始） */
  index: number;
  /** 歌词文本 */
  text: string;
  /** 是否为段落分隔（空行） */
  isBreak: boolean;
}

/** 清洗后的完整歌词结构 */
export interface ParsedLyric {
  /** 原词行列表 */
  lines: LyricLine[];
  /** 翻译词行列表（可选） */
  translationLines?: LyricLine[];
}
