/**
 * @fileoverview 歌曲相关类型定义
 */

/** 搜索结果中的单条歌曲 */
export interface SearchResult {
  /** 歌曲唯一 ID（数据源侧） */
  id: string;
  /** 歌曲名称 */
  name: string;
  /** 演唱者列表 */
  artists: Artist[];
  /** 所属专辑 */
  album: Album;
  /** 歌曲时长（毫秒） */
  duration: number;
}

/** 歌手信息 */
export interface Artist {
  id: string;
  name: string;
}

/** 专辑信息 */
export interface Album {
  id: string;
  name: string;
  /** 封面图 URL */
  coverUrl: string;
  /** 发行年份（如 "2023"） */
  publishYear?: string;
}

/** 锁定后的完整歌曲详情 */
export interface SongDetail {
  id: string;
  name: string;
  artists: Artist[];
  album: Album;
  duration: number;
}
