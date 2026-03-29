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
 * 使用公开部署的 NeteaseCloudMusicApi 服务；可通过环境变量覆盖
 * @see https://github.com/Binaryify/NeteaseCloudMusicApi
 */
const BASE_URL =
  process.env.NETEASE_API_URL ||
  'https://netease-cloud-music-api-five-roan.vercel.app';

/** 网易云返回的歌手项（精简字段） */
interface NeteaseArtistItem {
  id: number;
  name: string;
}

/** 网易云返回的专辑对象（精简字段） */
interface NeteaseAlbumRaw {
  id?: number;
  name?: string;
  picUrl?: string;
  publishTime?: number;
}

/** 网易云 cloudsearch 单条歌曲（精简字段） */
interface NeteaseSongRaw {
  id: number;
  name: string;
  ar?: NeteaseArtistItem[];
  al?: NeteaseAlbumRaw;
  dt?: number;
}

/** cloudsearch 响应体 */
interface CloudSearchBody {
  result?: { songs?: NeteaseSongRaw[] };
}

/** song/detail 响应体 */
interface SongDetailBody {
  songs?: NeteaseSongRaw[];
}

/** lyric 响应体 */
interface LyricBody {
  lrc?: { lyric?: string };
  tlyric?: { lyric?: string };
}

/**
 * 请求网易云 JSON 接口
 * @param {string} path - API 路径
 * @param {Record<string, string>} params - 查询参数
 * @returns {Promise<unknown>} 响应 JSON
 */
async function fetchApi(
  path: string,
  params: Record<string, string> = {}
): Promise<unknown> {
  const url = new URL(path, BASE_URL);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  /** 搜索与歌词需即时结果，不在服务端长期缓存 */
  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'LyricCanvas/1.0' },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Netease API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * 从网易云 API 歌手数组提取 Artist[]
 * @param {NeteaseArtistItem[] | undefined} ar - 原始歌手数组
 */
function mapArtists(ar: NeteaseArtistItem[] | undefined): Artist[] {
  return (ar ?? []).map((a) => ({ id: String(a.id), name: a.name }));
}

/**
 * 从网易云 API 专辑对象提取 Album
 * @param {NeteaseAlbumRaw | undefined} al - 原始专辑对象
 */
function mapAlbum(al: NeteaseAlbumRaw | undefined): Album {
  const x = al ?? {};
  const publishTime =
    typeof x.publishTime === 'number' ? new Date(x.publishTime) : null;
  return {
    id: String(x.id ?? ''),
    name: x.name ?? '',
    coverUrl: x.picUrl ?? '',
    publishYear: publishTime ? String(publishTime.getFullYear()) : undefined,
  };
}

/** 网易云音乐数据源 */
export const neteaseSource: MusicSource = {
  async search(keyword: string, limit = 20): Promise<SearchResult[]> {
    const raw = (await fetchApi('/cloudsearch', {
      keywords: keyword,
      limit: String(limit),
      type: '1',
    })) as CloudSearchBody;

    const songs = raw.result?.songs ?? [];
    return songs.map((s) => ({
      id: String(s.id),
      name: s.name,
      artists: mapArtists(s.ar),
      album: mapAlbum(s.al),
      duration: s.dt ?? 0,
    }));
  },

  async getSongDetail(id: string): Promise<SongDetail> {
    const raw = (await fetchApi('/song/detail', { ids: id })) as SongDetailBody;
    const s = raw.songs?.[0];
    if (!s) throw new Error(`Song not found: ${id}`);

    return {
      id: String(s.id),
      name: s.name,
      artists: mapArtists(s.ar),
      album: mapAlbum(s.al),
      duration: s.dt ?? 0,
    };
  },

  async getLyric(id: string): Promise<RawLyric> {
    const raw = (await fetchApi('/lyric', { id })) as LyricBody;
    return {
      original: raw.lrc?.lyric ?? '',
      translation: raw.tlyric?.lyric ?? undefined,
    };
  },
};
