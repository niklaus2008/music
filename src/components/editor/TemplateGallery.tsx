'use client';

/**
 * @fileoverview 模板选择画廊
 * 横向滚动的模板缩略图卡片，点击切换当前模板。
 */

import { cn } from '@/lib/utils';
import { templates } from '@/lib/templates';
import { useEditorStore } from '@/store/editor-store';

export function TemplateGallery() {
  const { template: active, setTemplate } = useEditorStore();

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
      {templates.map((t) => (
        <button
          key={t.id}
          onClick={() => setTemplate(t)}
          className={cn(
            'group flex flex-col items-center gap-2 rounded-xl border-2 p-2 transition-all duration-200 shrink-0 w-24',
            'hover:scale-105',
            active.id === t.id
              ? 'border-pink-500 bg-pink-500/5 shadow-lg ring-2 ring-pink-500/30 scale-105'
              : 'border-transparent hover:border-border hover:bg-muted/50'
          )}
        >
          {/* 模板缩略预览 */}
          <div
            className="h-20 w-20 rounded-lg shadow-sm transition-transform duration-200"
            style={{ background: t.background.value }}
          />
          <span className="text-xs font-medium">{t.name}</span>
        </button>
      ))}
    </div>
  );
}