'use client';

/**
 * @fileoverview 榜单展示组件
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSongStore } from '@/store/song-store';

interface ChartTrack {
  id: number;
  name: string;
  artists: { name: string }[];
  album: { name: string; picUrl: string };
}

/** 榜单列表 */
const CHARTS = [
  { id: 'rise', name: '飙升榜' },
  { id: 'new', name: '新歌榜' },
  { id: 'hot', name: '热歌榜' },
  { id: 'original', name: '原创榜' },
];

function normalizePicUrl(url: string | undefined): string {
  if (!url) return '';
  try {
    const u = new URL(url);
    if (u.protocol === 'http:') {
      u.protocol = 'https:';
      return u.toString();
    }
  } catch {}
  return url;
}

export function ChartList() {
  const router = useRouter();
  const [activeChart, setActiveChart] = useState('rise');
  const [tracks, setTracks] = useState<ChartTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const { selectSong } = useSongStore();

  useEffect(() => {
    async function fetchCharts() {
      setLoading(true);
      try {
        const res = await fetch(`/api/charts?list=${activeChart}`);
        const data = await res.json();
        setTracks(data.data || []);
      } catch (e) {
        console.error(e);
        setTracks([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCharts();
  }, [activeChart]);

  const handleClick = async (track: ChartTrack) => {
    // 构造 SearchResult 并选择歌曲
    const song: {
      id: string;
      name: string;
      artists: { id: string; name: string }[];
      album: { id: string; name: string; coverUrl: string };
      duration: number;
    } = {
      id: String(track.id),
      name: track.name,
      artists: track.artists.map((a) => ({ id: String(a.name), name: a.name })),
      album: {
        id: String(track.album?.name || ''),
        name: track.album?.name || '',
        coverUrl: normalizePicUrl(track.album?.picUrl),
      },
      duration: 0,
    };
    await selectSong(song);
    router.push('/editor');
  };

  const chartName = CHARTS.find((c) => c.id === activeChart)?.name || '飙升榜';

  return (
    <div>
      {/* 榜单 Tab */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        {CHARTS.map((chart) => (
          <button
            key={chart.id}
            onClick={() => setActiveChart(chart.id)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm transition-colors ${
              activeChart === chart.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {chart.name}
          </button>
        ))}
      </div>

      {/* 榜单列表 */}
      {loading ? (
        <div className="py-8 text-center text-muted-foreground">加载中...</div>
      ) : (
        <div className="space-y-1">
          {/* 标题 */}
          <h3 className="mb-3 text-lg font-semibold">{chartName}</h3>
          
          {/* 歌曲列表 */}
          {tracks.map((track, idx) => (
            <button
              key={track.id}
              onClick={() => handleClick(track)}
              className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-muted/50"
            >
              {/* 排名 */}
              <span
                className={`w-6 text-center text-sm font-medium ${
                  idx < 3 ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {idx + 1}
              </span>
              
              {/* 封面 */}
              <img
                src={normalizePicUrl(track.album?.picUrl)}
                alt=""
                className="h-10 w-10 shrink-0 rounded object-cover"
              />
              
              {/* 歌名/歌手 */}
              <div className="min-w-0 flex-1 overflow-hidden">
                <div className="truncate text-sm font-medium">{track.name}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {track.artists.map((a) => a.name).join(', ')}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}