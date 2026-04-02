'use client';

/**
 * @fileoverview 编辑器样式控制区
 * 比例、全文/金句、字体选择、A4 排版选项、自定义背景图。
 */

import { useRef } from 'react';
import type { ChangeEvent } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
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

/** SegmentedControl 风格的内容模式切换 */
function ContentModeSwitch({
  value,
  onChange,
}: {
  value: ContentMode;
  onChange: (v: ContentMode) => void;
}) {
  return (
    <div className="flex rounded-lg border border-input bg-transparent p-0.5">
      {(['full', 'quote'] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={cn(
            'flex-1 rounded-md py-1.5 text-sm font-medium transition-all',
            value === v
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {v === 'full' ? '全文' : '金句'}
        </button>
      ))}
    </div>
  );
}

/** 样式控制面板 */
export function EditorStylePanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    aspectRatio,
    setAspectRatio,
    contentMode,
    setContentMode,
    activeFont,
    setActiveFont,
    fontSize,
    setFontSize,
    a4Layout,
    setA4Layout,
    customBackgroundUrl,
    setCustomBackgroundFromFile,
  } = useEditorStore();
  const { parsedLyric } = useSongStore();

  const isA4 = aspectRatio === 'A4';
  const activeFontId =
    fontOptions.find((f) => f.family === activeFont)?.id ?? fontOptions[0].id;

  /**
   * 选择本地图片作为画布背景（歌词叠加在上方）
   * @param {ChangeEvent<HTMLInputElement>} e - 文件 input change
   */
  const handleBackgroundFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCustomBackgroundFromFile(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-5">
      {/* 输出比例 */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">输出比例</Label>
        <div className="grid grid-cols-4 gap-2">
          {ASPECT_RATIOS.map((r) => (
            <Button
              key={r}
              type="button"
              size="sm"
              className={cn(
                'w-full font-medium',
                aspectRatio === r
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
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
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">边距</Label>
              <span className="text-xs font-medium">{a4Layout.margin}px</span>
            </div>
            <Slider
              value={[a4Layout.margin]}
              onValueChange={(val) => {
                const arr = val as number[];
                setA4Layout({ margin: arr[0] });
              }}
              min={20}
              max={160}
              step={10}
              className="py-1"
            />
          </div>
        </>
      )}

      {/* 内容模式 - SegmentedControl */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">内容模式</Label>
        <ContentModeSwitch value={contentMode} onChange={setContentMode} />
      </div>

      {/* 字体大小 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">字体大小</Label>
          <span className="text-xs font-medium">{fontSize}px</span>
        </div>
        <Slider
          value={[fontSize]}
          onValueChange={(val) => {
            const arr = val as number[];
            setFontSize(arr[0]);
          }}
          min={12}
          max={48}
          step={2}
          className="py-1"
        />
      </div>

      {/* 字体选择 */}
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

      {/* 自定义背景图：叠加歌词 */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">自定义背景</Label>
        <p className="text-[10px] leading-snug text-muted-foreground">
          上传一张图片作为画布底图，歌词会叠在图片上方；不设置则使用当前模板的默认背景。
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleBackgroundFile}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="h-3.5 w-3.5" />
            上传图片
          </Button>
          {customBackgroundUrl ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1 text-muted-foreground"
              onClick={() => setCustomBackgroundFromFile(null)}
            >
              <X className="h-3.5 w-3.5" />
              清除背景
            </Button>
          ) : null}
        </div>
        {customBackgroundUrl ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-muted">
            <img
              src={customBackgroundUrl}
              alt="自定义背景预览"
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}