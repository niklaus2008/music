/**
 * @fileoverview 歌词解析器
 * 将原始 LRC 格式歌词清洗为结构化的 LyricLine 数组。
 * 处理逻辑：去除时间戳 → 剔除制作名单行 → 去除冗余符号 → 合并连续空行为段落分隔 → 编号。
 */

import type { RawLyric, LyricLine, ParsedLyric } from '@/types/lyric';

/** 匹配 LRC 时间戳：[00:12.34] 或 [00:12] */
const LRC_TIMESTAMP_RE = /\[\d{1,3}:\d{2}(?:[.:]\d{1,3})?\]/g;

/** 匹配纯元数据行：[ti:xxx] [ar:xxx] 等 */
const LRC_META_RE = /^\[(?:ti|ar|al|by|offset|re|ve):.+\]$/i;

/** 匹配无意义装饰符号行（如纯省略号、纯破折号等） */
const DECORATIVE_RE = /^[…—\-·.\s]+$/;

/**
 * 匹配常见制作名单行（词曲作者、乐手、混音等），此类行不应进入歌词正文。
 * 职务与冒号之间可含空白（网易云等来源常为「词 ：xxx」）；较长词在前，避免被短前缀误切。
 * 冒号含全角、半角及常见兼容字符。
 */
const LRC_CREDIT_LINE_RE =
  /^(?:作词|作曲|作詞|編曲|编曲|制作人|製作人|监制|監製|出品|音乐总监|和声编写|声乐指导|音乐统筹|混音|音频编辑|乐队总监|贝斯手|键盘手|吉他手|鼓手|PGM编写|PGM|合音|出品人|录音师|混音师|母带|策划|发行|版权|统筹|演唱|原唱|翻唱|制作|词\/曲|词／曲|词|曲|吉他|贝斯|键盘|鼓|和声|配唱|宣发|文案|封面|视觉|摄影|造型|化妆|发型|服装|导演|剪辑|摄像|艺人|经纪|后期|缩混|混音工程|混音助理|配器|管弦|弦乐|铜管|打击乐|笛子|萨克斯|钢琴|小提琴|古筝|二胡|琵琶|管弦乐|指挥|弦乐监制|Program|音乐制作|音乐编辑|艺人统筹|后期制作|声音编辑|录音|音频|OP|SP|ISRC|音乐)\s*[：:\uFF1A\u2236\uFE55]/;

/**
 * 去掉行首 BOM、零宽字符后再判断
 * @param {string} line - 单行文本
 * @returns {string}
 */
function stripLeadingInvisible(line: string): string {
  return line.replace(/^[\uFEFF\u200B\u200C\u200D]+/g, '');
}

/**
 * 是否为应剔除的制作名单行
 * @param {string} line - 已去时间戳、trim 后的单行
 * @returns {boolean}
 */
function isCreditStaffLine(line: string): boolean {
  const s = stripLeadingInvisible(line);
  return LRC_CREDIT_LINE_RE.test(s);
}

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

    const cleaned = stripLeadingInvisible(
      line.replace(LRC_TIMESTAMP_RE, '').trim()
    );

    if (isCreditStaffLine(cleaned)) {
      continue;
    }

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
