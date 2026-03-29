'use client';

/**
 * @fileoverview 编辑器样式控制区
 * 比例、全文/金句、字体选择。
 */

import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useEditorStore } from '@/store/editor-store';
import { fontOptions } from '@/lib/templates';
import type { AspectRatio, ContentMode } from '@/types/template';

const ASPECT_RATIOS: AspectRatio[] = ['1:1', '3:4', '9:16'];

/** 样式控制面板 */
export function EditorStylePanel() {
  const {
    aspectRatio,
    setAspectRatio,
    contentMode,
    setContentMode,
    activeFont,
    setActiveFont,
  } = useEditorStore();

  const activeFontId =
    fontOptions.find((f) => f.family === activeFont)?.id ?? fontOptions[0].id;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">输出比例</Label>
        <div className="grid grid-cols-3 gap-2">
          {ASPECT_RATIOS.map((r) => (
            <Button
              key={r}
              type="button"
              size="sm"
              variant={aspectRatio === r ? 'default' : 'outline'}
              className="w-full"
              onClick={() => setAspectRatio(r)}
            >
              {r}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">内容模式</Label>
        <div className={cn('grid grid-cols-2 gap-2')}>
          {(
            [
              { id: 'full' as const, label: '全文' },
              { id: 'quote' as const, label: '金句' },
            ] as const
          ).map(({ id, label }) => (
            <Button
              key={id}
              type="button"
              size="sm"
              variant={contentMode === id ? 'default' : 'outline'}
              className="w-full"
              onClick={() => setContentMode(id as ContentMode)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">正文字体</Label>
        <Select
          value={activeFontId}
          onValueChange={(id) => {
            const f = fontOptions.find((x) => x.id === id);
            if (f) setActiveFont(f.family);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="选择字体" />
          </SelectTrigger>
          <SelectContent>
            {fontOptions.map((f) => (
              <SelectItem key={f.id} value={f.id}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
