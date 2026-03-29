/**
 * @fileoverview 歌曲状态管理
 * 管理搜索结果、当前选中歌曲、歌词数据的全局状态。
 */

import { create } from 'zustand';
import type { SearchResult, SongDetail } from '@/types/song';
import type { ParsedLyric, RawLyric } from '@/types/lyric';
import { parseLyric } from '@/lib/lyric-parser';

interface SongState {
  /** 搜索关键词 */
  keyword: string;
  /** 搜索结果列表 */
  searchResults: SearchResult[];
  /** 搜索中 */
  searching: boolean;
  /** 当前锁定的歌曲详情 */
  currentSong: SongDetail | null;
  /** 解析后的歌词 */
  parsedLyric: ParsedLyric | null;
  /** 歌词加载中 */
  loadingLyric: boolean;

  /** 执行搜索 */
  search: (keyword: string) => Promise<void>;
  /** 锁定歌曲并加载歌词 */
  selectSong: (song: SearchResult) => Promise<void>;
  /** 清空当前歌曲 */
  clearSong: () => void;
}

export const useSongStore = create<SongState>((set) => ({
  keyword: '',
  searchResults: [],
  searching: false,
  currentSong: null,
  parsedLyric: null,
  loadingLyric: false,

  search: async (keyword: string) => {
    set({ keyword, searching: true, searchResults: [] });
    try {
      const res = await fetch(`/api/search?keyword=${encodeURIComponent(keyword)}`);
      const json = await res.json();
      set({ searchResults: json.data || [], searching: false });
    } catch {
      set({ searchResults: [], searching: false });
    }
  },

  selectSong: async (song: SearchResult) => {
    const detail: SongDetail = {
      id: song.id,
      name: song.name,
      artists: song.artists,
      album: song.album,
      duration: song.duration,
    };
    set({ currentSong: detail, loadingLyric: true, parsedLyric: null });

    try {
      const res = await fetch(`/api/lyric?id=${song.id}`);
      const json = await res.json();
      const raw: RawLyric = json.data;
      const parsed = parseLyric(raw);
      set({ parsedLyric: parsed, loadingLyric: false });
    } catch {
      set({ parsedLyric: null, loadingLyric: false });
    }
  },

  clearSong: () => {
    set({ currentSong: null, parsedLyric: null });
  },
}));
