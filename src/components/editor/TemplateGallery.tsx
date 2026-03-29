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
    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
      {templates.map((t) => (
        <button
          key={t.id}
          onClick={() => setTemplate(t)}
          className={cn(
            'flex flex-col items-center gap-1.5 rounded-xl border-2 p-2 transition-all shrink-0',
            active.id === t.id
              ? 'border-primary bg-primary/5 shadow-sm'
              : 'border-transparent hover:border-border'
          )}
        >
          {/* 模板缩略预览 */}
          <div
            className="h-20 w-16 rounded-lg"
            style={{ background: t.background.value }}
          />
          <span className="text-xs font-medium">{t.name}</span>
        </button>
      ))}
    </div>
  );
}
