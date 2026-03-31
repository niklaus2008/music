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

/** 排名样式 */
function RankBadge({ rank }: { rank: number }) {
  const rankClasses: Record<number, string> = {
    1: 'text-amber-500 font-bold text-lg',
    2: 'text-slate-400 font-bold text-lg',
    3: 'text-amber-700 font-bold text-lg',
  };
  const baseClass = rank <= 3 ? rankClasses[rank] : 'text-muted-foreground text-sm';

  return (
    <span className={`w-6 text-center ${baseClass}`}>
      {rank}
    </span>
  );
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
    const song = {
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
      <div className="mb-3 flex gap-2 overflow-x-auto pb-2">
        {CHARTS.map((chart) => (
          <button
            key={chart.id}
            onClick={() => setActiveChart(chart.id)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
              activeChart === chart.id
                ? 'bg-foreground text-background shadow-sm'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
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
        <div className="-mx-2">
          {/* 标题 */}
          <h3 className="mb-2 px-2 text-base font-semibold">{chartName}</h3>

          {/* 歌曲列表 */}
          {tracks.map((track, idx) => (
            <button
              key={track.id}
              onClick={() => handleClick(track)}
              className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-muted/60 active:bg-muted"
            >
              {/* 排名 */}
              <RankBadge rank={idx + 1} />

              {/* 封面 */}
              <img
                src={normalizePicUrl(track.album?.picUrl)}
                alt=""
                className="h-12 w-12 shrink-0 rounded-lg shadow-sm object-cover"
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