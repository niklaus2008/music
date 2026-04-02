/**
 * @fileoverview 歌词与辅色快捷色板（`null` 表示跟随当前风格默认色）
 */

/**
 * 歌词主色快捷项
 */
export const LYRIC_COLOR_SWATCHES: { label: string; value: string | null }[] = [
  { label: '默认', value: null },
  { label: '墨黑', value: '#1a1a1a' },
  { label: '霜白', value: '#f5f5f5' },
  { label: '炭灰', value: '#3d3d3d' },
  { label: '绛红', value: '#c0392b' },
  { label: '靛青', value: '#1e3a5f' },
];

/**
 * 副标题/说明色快捷项
 */
export const META_COLOR_SWATCHES: { label: string; value: string | null }[] = [
  { label: '默认', value: null },
  { label: '深灰', value: '#5c5c5c' },
  { label: '浅灰', value: '#9ca3af' },
  { label: '暖褐', value: '#8b7355' },
  { label: '雾蓝', value: '#5d8aa8' },
];
