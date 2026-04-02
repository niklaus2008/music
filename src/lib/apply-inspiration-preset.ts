/**
 * @fileoverview 将灵感墙条目应用到编辑器：拉取歌曲、歌词后写入模板与选行
 */

import type { InspirationItem } from '@/types/inspiration';
import type { SearchResult } from '@/types/song';
import { templates } from '@/lib/templates';
import { useSongStore } from '@/store/song-store';
import { useEditorStore } from '@/store/editor-store';

export type ApplyInspirationResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * 校验并解析模板 id，缺省回退到首个内置模板
 * @param {string | undefined} templateId - 配置中的模板 id
 */
function resolveTemplate(templateId: string | undefined) {
  return templates.find((t) => t.id === templateId) ?? templates[0];
}

/**
 * 执行「做同款」：请求歌曲详情并加载歌词，再应用模板、比例、模式、金句行与预览图底图
 * @param {InspirationItem} item - 静态配置条目
 * @returns {Promise<ApplyInspirationResult>} 成功或错误信息
 */
export async function applyInspirationPreset(
  item: InspirationItem
): Promise<ApplyInspirationResult> {
  if (!item.songId?.trim()) {
    return { ok: false, error: '该示例未关联歌曲，请从首页搜索后创作' };
  }

  let res: Response;
  try {
    res = await fetch(
      `/api/song?id=${encodeURIComponent(item.songId.trim())}`
    );
  } catch {
    return { ok: false, error: '网络异常，请稍后重试' };
  }

  const json: { data?: SearchResult; error?: string } = await res.json();
  if (!res.ok || !json.data) {
    return {
      ok: false,
      error: json.error ?? '获取歌曲失败，可能已下架或 ID 无效',
    };
  }

  const song = json.data as SearchResult;
  await useSongStore.getState().selectSong(song);

  const parsed = useSongStore.getState().parsedLyric;
  if (!parsed) {
    const err = useSongStore.getState().lyricError;
    return {
      ok: false,
      error: err ?? '歌词加载失败',
    };
  }

  const template = resolveTemplate(item.templateId);
  const aspectRatio = item.aspectRatio ?? '3:4';
  const contentMode =
    item.contentMode ?? (item.selectedLineIndices?.length ? 'quote' : 'full');

  const editor = useEditorStore.getState();
  /**
   * 与灵感弹窗大图一致：将条目 `previewUrl` 设为画布底图；无地址则沿用模板默认背景
   */
  if (item.previewUrl?.trim()) {
    editor.setCustomBackgroundUrl(item.previewUrl.trim());
  } else {
    editor.setCustomBackgroundUrl(null);
  }
  editor.setTemplate(template);
  editor.setAspectRatio(aspectRatio);
  editor.setContentMode(contentMode);
  editor.setFontSize(template.typography.fontSize);
  editor.setA4Layout({ activePage: 0 });

  if (contentMode === 'quote' && item.selectedLineIndices?.length) {
    const valid = item.selectedLineIndices.filter((idx) =>
      parsed.lines.some((l) => l.index === idx && !l.isBreak)
    );
    if (valid.length > 0) {
      editor.selectAllLines(valid);
    } else {
      const firstContent = parsed.lines.find((l) => !l.isBreak && l.text);
      if (firstContent) {
        editor.selectAllLines([firstContent.index]);
      } else {
        editor.clearLines();
      }
    }
  } else {
    editor.clearLines();
  }

  return { ok: true };
}
