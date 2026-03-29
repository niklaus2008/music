/**
 * @fileoverview 歌曲卡片组件
 * 展示封面、歌名、歌手、专辑信息，点击后锁定歌曲。
 */

'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { SearchResult } from '@/types/song';
import { useSongStore } from '@/store/song-store';
import { Badge } from '@/components/ui/badge';

interface SongCardProps {
  song: SearchResult;
}

export function SongCard({ song }: SongCardProps) {
  const { selectSong } = useSongStore();
  const router = useRouter();

  /** 格式化时长 mm:ss */
  const formatDuration = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const handleClick = async () => {
    await selectSong(song);
    router.push('/editor');
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-4 w-full p-3 rounded-xl hover:bg-accent/60 transition-colors text-left group"
    >
      <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-muted">
        {song.album.coverUrl ? (
          <Image
            src={song.album.coverUrl}
            alt={song.album.name}
            fill
            className="object-cover"
            sizes="56px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            暂无
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate group-hover:text-primary transition-colors">
          {song.name}
        </p>
        <p className="text-sm text-muted-foreground truncate">
          {song.artists.map((a) => a.name).join(' / ')}
          {song.album.name && ` · ${song.album.name}`}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {song.album.publishYear && (
          <Badge variant="secondary" className="text-xs">
            {song.album.publishYear}
          </Badge>
        )}
        <span className="text-xs text-muted-foreground tabular-nums">
          {formatDuration(song.duration)}
        </span>
      </div>
    </button>
  );
}
