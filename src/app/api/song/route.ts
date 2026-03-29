/**
 * @fileoverview 歌曲详情 API Route
 * GET /api/song?id=xxx
 */

import { NextRequest, NextResponse } from 'next/server';
import { neteaseSource } from '@/lib/api/netease';

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');

  if (!id?.trim()) {
    return NextResponse.json({ error: '缺少歌曲 ID' }, { status: 400 });
  }

  try {
    const detail = await neteaseSource.getSongDetail(id.trim());
    return NextResponse.json({ data: detail });
  } catch (err) {
    console.error('[API /song]', err);
    return NextResponse.json({ error: '获取歌曲详情失败' }, { status: 500 });
  }
}
