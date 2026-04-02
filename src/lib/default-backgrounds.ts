/**
 * @fileoverview 编辑器内置默认底图（位于 `public/backgrounds/`，构建后路径以 `/backgrounds/` 开头）
 */

/**
 * 单张预设底图
 */
export interface DefaultBackgroundPreset {
  /** 稳定 id，用于 React key */
  id: string;
  /** 展示名称 */
  label: string;
  /** 公开路径（Next `public` 目录） */
  src: string;
}

/**
 * 内置底图列表（与 `public/backgrounds/preset-*.png` 一一对应）
 */
export const DEFAULT_BACKGROUND_PRESETS: DefaultBackgroundPreset[] = [
  { id: 'p01', label: '底图 1', src: '/backgrounds/preset-01.png' },
  { id: 'p02', label: '底图 2', src: '/backgrounds/preset-02.png' },
  { id: 'p03', label: '底图 3', src: '/backgrounds/preset-03.png' },
  { id: 'p04', label: '底图 4', src: '/backgrounds/preset-04.png' },
  { id: 'p05', label: '底图 5', src: '/backgrounds/preset-05.png' },
  { id: 'p06', label: '底图 6', src: '/backgrounds/preset-06.png' },
  { id: 'p07', label: '底图 7', src: '/backgrounds/preset-07.png' },
  { id: 'p08', label: '底图 8', src: '/backgrounds/preset-08.png' },
  { id: 'p09', label: '底图 9', src: '/backgrounds/preset-09.png' },
];
