/**
 * @fileoverview 网易云音乐数据源实现
 * 默认直连网易云官网公开 JSON 接口（无需第三方部署）；也可通过 `NETEASE_API_URL` 使用
 * [NeteaseCloudMusicApi](https://github.com/Binaryify/NeteaseCloudMusicApi) 兼容代理。
 */

import type { MusicSource } from './music-source';
import type { SearchResult, SongDetail, Artist, Album } from '@/types/song';
import type { RawLyric } from '@/types/lyric';

/** 官网接口源站 */
const OFFICIAL_ORIGIN = 'https://music.163.com';

/**
 * 将网易云 CDN 封面地址规范为 https，供 `next/image` 与 `remotePatterns`（仅声明 https）一致。
 * 官网接口常返回 `http://p*.music.126.net/...`。
 * @param {string | undefined} url - 原始 picUrl
 * @returns {string} 规范化后的 URL
 */
function normalizeNeteasePicUrl(url: string | undefined): string {
  if (!url) return '';
  try {
    const u = new URL(url);
    if (/^p[1-6]\.music\.126\.net$/i.test(u.hostname) && u.protocol === 'http:') {
      u.protocol = 'https:';
      return u.toString();
    }
  } catch {
    /* 非绝对 URL 时原样返回 */
  }
  return url;
}

/**
 * 是否使用自建 / Binaryify 代理（设置 `NETEASE_API_URL` 时启用）
 */
function useProxy(): boolean {
  return Boolean(process.env.NETEASE_API_URL?.trim());
}

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

/** Binaryify song/detail 响应（与 cloudsearch 条目结构相近） */
interface SongDetailBody {
  songs?: NeteaseSongRaw[];
}

/** 官网 /song/detail 单条（字段名为 artists / album） */
interface OfficialSongDetailItem {
  id: number;
  name: string;
  dt?: number;
  artists?: { id: number; name: string }[];
  album?: {
    id?: number;
    name?: string;
    picUrl?: string;
    publishTime?: number;
  };
}

interface OfficialSongDetailBody {
  songs?: OfficialSongDetailItem[];
}

/** lyric 响应体 */
interface LyricBody {
  lrc?: { lyric?: string };
  tlyric?: { lyric?: string };
}

/**
 * 请求 Binaryify 兼容代理
 * @param {string} path - API 路径
 * @param {Record<string, string>} params - 查询参数
 */
async function fetchProxy(
  path: string,
  params: Record<string, string> = {}
): Promise<unknown> {
  const base = process.env.NETEASE_API_URL?.trim();
  if (!base) {
    throw new Error('NETEASE_API_URL 未配置');
  }
  const url = new URL(path, base);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'LyricCanvas/1.0' },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Netease proxy error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * 请求网易云官网 JSON（需浏览器式 UA / Referer，否则易失败）
 * @param {string} path - 路径，如 `/api/cloudsearch/pc`
 * @param {Record<string, string>} params - 查询参数
 */
async function fetchOfficial(
  path: string,
  params: Record<string, string> = {}
): Promise<unknown> {
  const url = new URL(path, OFFICIAL_ORIGIN);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Referer: 'https://music.163.com/',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Netease official API error: ${res.status} ${res.statusText}`);
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
    coverUrl: normalizeNeteasePicUrl(x.picUrl),
    publishYear: publishTime ? String(publishTime.getFullYear()) : undefined,
  };
}

/**
 * 官网 song/detail 单条转 SongDetail
 * @param {OfficialSongDetailItem} s - 原始对象
 */
function mapOfficialSongDetail(s: OfficialSongDetailItem): SongDetail {
  const al = s.album;
  const pt =
    al && typeof al.publishTime === 'number'
      ? new Date(al.publishTime)
      : null;
  return {
    id: String(s.id),
    name: s.name,
    artists: (s.artists ?? []).map((a) => ({
      id: String(a.id),
      name: a.name,
    })),
    album: {
      id: String(al?.id ?? ''),
      name: al?.name ?? '',
      coverUrl: normalizeNeteasePicUrl(al?.picUrl),
      publishYear: pt ? String(pt.getFullYear()) : undefined,
    },
    duration: s.dt ?? 0,
  };
}

/** 网易云音乐数据源 */
export const neteaseSource: MusicSource = {
  async search(keyword: string, limit = 20): Promise<SearchResult[]> {
    const raw = (await (useProxy()
      ? fetchProxy('/cloudsearch', {
          keywords: keyword,
          limit: String(limit),
          type: '1',
        })
      : fetchOfficial('/api/cloudsearch/pc', {
          s: keyword,
          type: '1',
          limit: String(limit),
          offset: '0',
        }))) as CloudSearchBody;

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
    if (useProxy()) {
      const raw = (await fetchProxy('/song/detail', {
        ids: id,
      })) as SongDetailBody;
      const s = raw.songs?.[0];
      if (!s) throw new Error(`Song not found: ${id}`);
      return {
        id: String(s.id),
        name: s.name,
        artists: mapArtists(s.ar),
        album: mapAlbum(s.al),
        duration: s.dt ?? 0,
      };
    }

    const raw = (await fetchOfficial('/api/song/detail', {
      ids: `[${id}]`,
    })) as OfficialSongDetailBody;
    const s = raw.songs?.[0];
    if (!s) throw new Error(`Song not found: ${id}`);
    return mapOfficialSongDetail(s);
  },

  async getLyric(id: string): Promise<RawLyric> {
    const raw = (await (useProxy()
      ? fetchProxy('/lyric', { id })
      : fetchOfficial('/api/song/lyric', {
          id,
          lv: '-1',
          kv: '-1',
          tv: '-1',
        }))) as LyricBody;
    return {
      original: raw.lrc?.lyric ?? '',
      translation: raw.tlyric?.lyric ?? undefined,
    };
  },
};
