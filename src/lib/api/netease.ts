/**
 * @fileoverview 网易云音乐数据源实现
 * 使用公开的网易云音乐 API 接口（NeteaseCloudMusicApi）
 * 通过 Next.js API Routes 代理调用，避免跨域和暴露细节。
 */

import type { MusicSource } from './music-source';
import type { SearchResult, SongDetail, Artist, Album } from '@/types/song';
import type { RawLyric } from '@/types/lyric';

/**
 * 网易云 API 基础地址
 * 使用公开部署的 NeteaseCloudMusicApi 服务
 * @see https://github.com/Binaryify/NeteaseCloudMusicApi
 */
const BASE_URL = process.env.NETEASE_API_URL || 'https://netease-cloud-music-api-five-roan.vercel.app';

/**
 * @param {string} path - API 路径
 * @param {Record<string, string>} params - 查询参数
 * @returns {Promise<any>} 响应 JSON
 */
async function fetchApi(path: string, params: Record<string, string> = {}): Promise<any> {
  const url = new URL(path, BASE_URL);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'LyricCanvas/1.0' },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Netease API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * 从网易云 API 歌手数组提取 Artist[]
 * @param {any[]} ar - 原始歌手数组
 */
function mapArtists(ar: any[] = []): Artist[] {
  return ar.map((a) => ({ id: String(a.id), name: a.name }));
}

/**
 * 从网易云 API 专辑对象提取 Album
 * @param {any} al - 原始专辑对象
 */
function mapAlbum(al: any = {}): Album {
  const publishTime = al.publishTime ? new Date(al.publishTime) : null;
  return {
    id: String(al.id || ''),
    name: al.name || '',
    coverUrl: al.picUrl || '',
    publishYear: publishTime ? String(publishTime.getFullYear()) : undefined,
  };
}

/** 网易云音乐数据源 */
export const neteaseSource: MusicSource = {
  async search(keyword: string, limit = 20): Promise<SearchResult[]> {
    const data = await fetchApi('/cloudsearch', {
      keywords: keyword,
      limit: String(limit),
      type: '1',
    });

    const songs = data?.result?.songs || [];
    return songs.map((s: any) => ({
      id: String(s.id),
      name: s.name,
      artists: mapArtists(s.ar),
      album: mapAlbum(s.al),
      duration: s.dt || 0,
    }));
  },

  async getSongDetail(id: string): Promise<SongDetail> {
    const data = await fetchApi('/song/detail', { ids: id });
    const s = data?.songs?.[0];
    if (!s) throw new Error(`Song not found: ${id}`);

    return {
      id: String(s.id),
      name: s.name,
      artists: mapArtists(s.ar),
      album: mapAlbum(s.al),
      duration: s.dt || 0,
    };
  },

  async getLyric(id: string): Promise<RawLyric> {
    const data = await fetchApi('/lyric', { id });
    return {
      original: data?.lrc?.lyric || '',
      translation: data?.tlyric?.lyric || undefined,
    };
  },
};
