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
  /** 搜索失败时的提示文案 */
  searchError: string | null;
  /** 当前锁定的歌曲详情 */
  currentSong: SongDetail | null;
  /** 解析后的歌词 */
  parsedLyric: ParsedLyric | null;
  /** 歌词加载中 */
  loadingLyric: boolean;
  /** 歌词加载失败时的提示文案 */
  lyricError: string | null;

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
  searchError: null,
  currentSong: null,
  parsedLyric: null,
  loadingLyric: false,
  lyricError: null,

  search: async (keyword: string) => {
    set({
      keyword,
      searching: true,
      searchResults: [],
      searchError: null,
    });
    try {
      const res = await fetch(
        `/api/search?keyword=${encodeURIComponent(keyword)}`
      );
      const json: { data?: SearchResult[]; error?: string } = await res.json();
      if (!res.ok) {
        set({
          searchResults: [],
          searching: false,
          searchError: json.error ?? '搜索失败，请稍后重试',
        });
        return;
      }
      set({
        searchResults: json.data ?? [],
        searching: false,
        searchError: null,
      });
    } catch {
      set({
        searchResults: [],
        searching: false,
        searchError: '网络异常，请检查连接后重试',
      });
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
    set({
      currentSong: detail,
      loadingLyric: true,
      parsedLyric: null,
      lyricError: null,
    });

    try {
      const res = await fetch(`/api/lyric?id=${song.id}`);
      const json: { data?: RawLyric; error?: string } = await res.json();
      if (!res.ok) {
        set({
          parsedLyric: null,
          loadingLyric: false,
          lyricError: json.error ?? '获取歌词失败',
        });
        return;
      }
      const raw = json.data;
      if (!raw) {
        set({
          parsedLyric: null,
          loadingLyric: false,
          lyricError: '暂无歌词数据',
        });
        return;
      }
      const parsed = parseLyric(raw);
      set({
        parsedLyric: parsed,
        loadingLyric: false,
        lyricError: null,
      });
    } catch {
      set({
        parsedLyric: null,
        loadingLyric: false,
        lyricError: '网络异常，请检查连接后重试',
      });
    }
  },

  clearSong: () => {
    set({
      currentSong: null,
      parsedLyric: null,
      lyricError: null,
    });
  },
}));
