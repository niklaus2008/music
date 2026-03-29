/**
 * @fileoverview 音乐数据源抽象层
 * 所有第三方数据源（网易云、Musixmatch、LrcLib 等）均实现此接口，
 * 上层代码仅依赖此接口，便于无缝切换数据源。
 */

import type { SearchResult, SongDetail } from '@/types/song';
import type { RawLyric } from '@/types/lyric';

/** 数据源统一接口 */
export interface MusicSource {
  /** 根据关键词搜索歌曲 */
  search(keyword: string, limit?: number): Promise<SearchResult[]>;
  /** 根据歌曲 ID 获取完整详情 */
  getSongDetail(id: string): Promise<SongDetail>;
  /** 根据歌曲 ID 获取原始歌词 */
  getLyric(id: string): Promise<RawLyric>;
}
