/**
 * @fileoverview 歌曲搜索 API Route
 * GET /api/search?keyword=xxx&limit=20
 */

import { NextRequest, NextResponse } from 'next/server';
import { neteaseSource } from '@/lib/api/netease';

export async function GET(req: NextRequest) {
  const keyword = req.nextUrl.searchParams.get('keyword');
  const limit = Number(req.nextUrl.searchParams.get('limit') || '20');

  if (!keyword?.trim()) {
    return NextResponse.json({ error: '缺少搜索关键词' }, { status: 400 });
  }

  try {
    const results = await neteaseSource.search(keyword.trim(), limit);
    return NextResponse.json({ data: results });
  } catch (err) {
    console.error('[API /search]', err);
    return NextResponse.json({ error: '搜索失败，请稍后重试' }, { status: 500 });
  }
}
