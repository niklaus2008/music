/**
 * @fileoverview 歌词获取 API Route
 * GET /api/lyric?id=xxx
 */

import { NextRequest, NextResponse } from 'next/server';
import { neteaseSource } from '@/lib/api/netease';

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');

  if (!id?.trim()) {
    return NextResponse.json({ error: '缺少歌曲 ID' }, { status: 400 });
  }

  try {
    const lyric = await neteaseSource.getLyric(id.trim());
    return NextResponse.json({ data: lyric });
  } catch (err) {
    console.error('[API /lyric]', err);
    return NextResponse.json({ error: '获取歌词失败' }, { status: 500 });
  }
}
