'use client';

/**
 * @fileoverview 编辑器样式控制区
 * 比例、全文/金句、字体选择、A4 排版选项。
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
import { useEditorStore, type A4LayoutOptions } from '@/store/editor-store';
import { useSongStore } from '@/store/song-store';
import { fontOptions } from '@/lib/templates';
import type { AspectRatio, ContentMode } from '@/types/template';

const ASPECT_RATIOS: AspectRatio[] = ['1:1', '3:4', '9:16', 'A4'];

const LINES_PER_PAGE_OPTIONS: { value: A4LayoutOptions['linesPerPage']; label: string }[] = [
  { value: 30, label: '30行/页' },
  { value: 40, label: '40行/页' },
  { value: 50, label: '50行/页' },
  { value: 60, label: '60行/页' },
];

const MARGIN_OPTIONS: { value: A4LayoutOptions['margin']; label: string }[] = [
  { value: 'compact', label: '紧凑' },
  { value: 'standard', label: '标准' },
  { value: 'relaxed', label: '宽松' },
];

/** 样式控制面板 */
export function EditorStylePanel() {
  const {
    aspectRatio,
    setAspectRatio,
    contentMode,
    setContentMode,
    activeFont,
    setActiveFont,
    a4Layout,
    setA4Layout,
  } = useEditorStore();
  const { parsedLyric } = useSongStore();

  const isA4 = aspectRatio === 'A4';
  const activeFontId =
    fontOptions.find((f) => f.family === activeFont)?.id ?? fontOptions[0].id;

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">输出比例</Label>
        <div className="grid grid-cols-4 gap-2">
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

      {isA4 && (
        <>
          <div className="rounded-md bg-muted p-3 text-center">
            <p className="text-xs text-muted-foreground">预估分页</p>
            <p className="text-lg font-semibold text-foreground">
              {parsedLyric
                ? Math.ceil(parsedLyric.lines.length / a4Layout.linesPerPage)
                : '-'}{' '}
              <span className="text-xs font-normal text-muted-foreground">页</span>
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              {parsedLyric?.lines.length || 0} 行 ÷ {a4Layout.linesPerPage} 行/页
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">每页行数</Label>
            <div className="grid grid-cols-4 gap-2">
              {LINES_PER_PAGE_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  size="sm"
                  variant={a4Layout.linesPerPage === opt.value ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => setA4Layout({ linesPerPage: opt.value })}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">排版方向</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                size="sm"
                variant={a4Layout.direction === 'horizontal' ? 'default' : 'outline'}
                className="w-full"
                onClick={() => setA4Layout({ direction: 'horizontal' })}
              >
                横排
              </Button>
              <Button
                type="button"
                size="sm"
                variant={a4Layout.direction === 'vertical' ? 'default' : 'outline'}
                className="w-full"
                onClick={() => setA4Layout({ direction: 'vertical' })}
              >
                竖排
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">边距预设</Label>
            <div className="grid grid-cols-3 gap-2">
              {MARGIN_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  size="sm"
                  variant={a4Layout.margin === opt.value ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => setA4Layout({ margin: opt.value })}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">页眉/页脚</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                size="sm"
                variant={a4Layout.showHeader ? 'default' : 'outline'}
                className="w-full"
                onClick={() => setA4Layout({ showHeader: !a4Layout.showHeader })}
              >
                {a4Layout.showHeader ? '✓ 页眉' : '✗ 页眉'}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={a4Layout.showFooter ? 'default' : 'outline'}
                className="w-full"
                onClick={() => setA4Layout({ showFooter: !a4Layout.showFooter })}
              >
                {a4Layout.showFooter ? '✓ 页脚' : '✗ 页脚'}
              </Button>
            </div>
          </div>
        </>
      )}

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
