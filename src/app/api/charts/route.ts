/**
 * @fileoverview 榜单歌曲 API
 * GET /api/charts
 */

import { NextRequest, NextResponse } from 'next/server';

const OFFICIAL_ORIGIN = 'https://music.163.com';

/** 榜单 ID 定义 */
const CHARTS = {
  rise: 19723756,   // 飙升榜
  new: 3779629,    // 新歌榜
  hot: 3778678,    // 热歌榜
  original: 111835188, // 原创榜
};

interface Track {
  id: number;
  name: string;
  artists: { name: string }[];
  album: { name: string; picUrl: string };
}

/**
 * 请求网易云榜单
 */
async function fetchChart(listId: number): Promise<Track[]> {
  const res = await fetch(
    `https://music.163.com/api/playlist/detail?id=${listId}`,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://music.163.com/',
      },
      cache: 'no-store',
    }
  );
  const data = await res.json();
  return (data.result?.tracks ?? []).slice(0, 10);
}

export async function GET(req: NextRequest) {
  const list = req.nextUrl.searchParams.get('list') || 'rise';
  const listId = CHARTS[list as keyof typeof CHARTS] || CHARTS.rise;

  try {
    const tracks = await fetchChart(listId);
    return NextResponse.json({ data: tracks, list: { id: list, listId } });
  } catch (err) {
    console.error('[API /charts]', err);
    return NextResponse.json({ error: '获取榜单失败' }, { status: 500 });
  }
}