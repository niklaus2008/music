/**
 * @fileoverview 歌词解析器
 * 将原始 LRC 格式歌词清洗为结构化的 LyricLine 数组。
 * 处理逻辑：去除时间戳 → 去除冗余符号 → 合并连续空行为段落分隔 → 编号。
 */

import type { RawLyric, LyricLine, ParsedLyric } from '@/types/lyric';

/** 匹配 LRC 时间戳：[00:12.34] 或 [00:12] */
const LRC_TIMESTAMP_RE = /\[\d{1,3}:\d{2}(?:[.:]\d{1,3})?\]/g;

/** 匹配纯元数据行：[ti:xxx] [ar:xxx] 等 */
const LRC_META_RE = /^\[(?:ti|ar|al|by|offset|re|ve):.+\]$/i;

/** 匹配无意义装饰符号行（如纯省略号、纯破折号等） */
const DECORATIVE_RE = /^[…—\-·.\s]+$/;

/**
 * 解析单语种歌词文本为 LyricLine[]
 * @param {string} raw - 原始歌词文本
 * @returns {LyricLine[]} 清洗后的歌词行数组
 */
function parseLines(raw: string): LyricLine[] {
  if (!raw || !raw.trim()) return [];

  const result: LyricLine[] = [];
  let lineIndex = 0;
  let prevWasBreak = false;

  const lines = raw.split('\n');

  for (const line of lines) {
    if (LRC_META_RE.test(line.trim())) continue;

    const cleaned = line
      .replace(LRC_TIMESTAMP_RE, '')
      .trim();

    if (!cleaned || DECORATIVE_RE.test(cleaned)) {
      if (!prevWasBreak && result.length > 0) {
        result.push({ index: lineIndex++, text: '', isBreak: true });
        prevWasBreak = true;
      }
      continue;
    }

    result.push({ index: lineIndex++, text: cleaned, isBreak: false });
    prevWasBreak = false;
  }

  if (result.length > 0 && result[result.length - 1].isBreak) {
    result.pop();
  }

  return result;
}

/**
 * 将 RawLyric 解析为完整的 ParsedLyric
 * @param {RawLyric} raw - 数据源返回的原始歌词
 * @returns {ParsedLyric} 结构化歌词
 */
export function parseLyric(raw: RawLyric): ParsedLyric {
  return {
    lines: parseLines(raw.original),
    translationLines: raw.translation ? parseLines(raw.translation) : undefined,
  };
}
