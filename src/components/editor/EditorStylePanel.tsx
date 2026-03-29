'use client';

/**
 * @fileoverview 编辑器样式控制区
 * 比例、全文/金句、字体选择。
 */

import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEditorStore } from '@/store/editor-store';
import { fontOptions } from '@/lib/templates';
import type { AspectRatio, ContentMode } from '@/types/template';

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
        <ToggleGroup
          type="single"
          value={aspectRatio}
          onValueChange={(v) => v && setAspectRatio(v as AspectRatio)}
          className="justify-start"
        >
          <ToggleGroupItem value="1:1" className="flex-1">
            1:1
          </ToggleGroupItem>
          <ToggleGroupItem value="3:4" className="flex-1">
            3:4
          </ToggleGroupItem>
          <ToggleGroupItem value="9:16" className="flex-1">
            9:16
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">内容模式</Label>
        <ToggleGroup
          type="single"
          value={contentMode}
          onValueChange={(v) => v && setContentMode(v as ContentMode)}
          className="grid w-full grid-cols-2"
        >
          <ToggleGroupItem value="full" className="flex-1">
            全文
          </ToggleGroupItem>
          <ToggleGroupItem value="quote" className="flex-1">
            金句
          </ToggleGroupItem>
        </ToggleGroup>
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
