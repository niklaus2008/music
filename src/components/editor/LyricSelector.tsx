'use client';

/**
 * @fileoverview 金句选择器
 * 金句模式下允许点击行进行勾选。
 */

import { cn } from '@/lib/utils';
import { useSongStore } from '@/store/song-store';
import { useEditorStore } from '@/store/editor-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check } from 'lucide-react';

export function LyricSelector() {
  const { parsedLyric } = useSongStore();
  const { selectedLines, toggleLine } = useEditorStore();

  if (!parsedLyric) return null;

  const lines = parsedLyric.lines;

  return (
    <ScrollArea className="h-64 rounded-lg border bg-muted/30 p-3">
      <div className="space-y-0.5">
        {lines.map((line) => {
          if (line.isBreak) {
            return <div key={`brk-${line.index}`} className="h-3" />;
          }

          const selected = selectedLines.has(line.index);

          return (
            <button
              key={line.index}
              onClick={() => toggleLine(line.index)}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-2 py-1 text-sm text-left cursor-pointer hover:bg-accent transition-colors',
                selected && 'bg-primary/10 text-primary font-medium'
              )}
            >
              <span
                className={cn(
                  'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                  selected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted-foreground/30'
                )}
              >
                {selected && <Check className="h-3 w-3" />}
              </span>
              <span>{line.text}</span>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
