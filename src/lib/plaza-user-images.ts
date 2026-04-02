/**
 * @fileoverview 歌词广场用户上传图：本地压缩后存入 localStorage，仅本机持久化
 */

const STORAGE_KEY = 'lyric-plaza-user-images-v1';
/** 最多保留张数（与下方逻辑一致：新图在前，超出则丢弃末尾即最先上传的） */
export const PLAZA_USER_IMAGE_MAX_COUNT = 30;

const MAX_COUNT = PLAZA_USER_IMAGE_MAX_COUNT;
/** 长边像素上限，控制体积（导出供 UI 文案使用） */
export const PLAZA_USER_IMAGE_MAX_EDGE = 1600;
/** JPEG 质量 */
const JPEG_Q = 0.82;

/**
 * 单条用户上传记录
 */
export interface PlazaUserImage {
  /** 唯一 id */
  id: string;
  /** 展示用 JPEG data URL */
  dataUrl: string;
  /** 原始文件名（无扩展名亦可） */
  name: string;
  /** 创建时间戳 */
  createdAt: number;
}

/**
 * 从 localStorage 读取列表（解析失败返回空数组）
 */
export function loadPlazaUserImages(): PlazaUserImage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is PlazaUserImage =>
        typeof x === 'object' &&
        x !== null &&
        typeof (x as PlazaUserImage).id === 'string' &&
        typeof (x as PlazaUserImage).dataUrl === 'string' &&
        typeof (x as PlazaUserImage).name === 'string'
    );
  } catch {
    return [];
  }
}

/**
 * 写入 localStorage
 * @param {PlazaUserImage[]} items - 完整列表
 */
function savePlazaUserImages(items: PlazaUserImage[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/**
 * 将文件压成 JPEG data URL
 * @param {File} file - 用户选择的图片
 */
async function fileToResizedDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const w0 = bitmap.width;
  const h0 = bitmap.height;
  const scale = Math.min(1, PLAZA_USER_IMAGE_MAX_EDGE / Math.max(w0, h0));
  const w = Math.max(1, Math.round(w0 * scale));
  const h = Math.max(1, Math.round(h0 * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法创建画布');
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  const dataUrl = canvas.toDataURL('image/jpeg', JPEG_Q);
  return dataUrl;
}

/**
 * 添加上传：压缩、截断数量、写入存储
 * @param {File} file - 图片文件
 * @returns {Promise<{ ok: true; item: PlazaUserImage } | { ok: false; error: string }>}
 */
export async function addPlazaUserImage(
  file: File
): Promise<{ ok: true; item: PlazaUserImage } | { ok: false; error: string }> {
  if (!file.type.startsWith('image/')) {
    return { ok: false, error: '请选择图片文件' };
  }
  let dataUrl: string;
  try {
    dataUrl = await fileToResizedDataUrl(file);
  } catch {
    return { ok: false, error: '图片读取失败，请换一张试试' };
  }

  const item: PlazaUserImage = {
    id:
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `u-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    dataUrl,
    name: file.name.replace(/\.[^.]+$/, '') || '未命名图片',
    createdAt: Date.now(),
  };

  const prev = loadPlazaUserImages();
  const next = [item, ...prev].slice(0, MAX_COUNT);

  try {
    savePlazaUserImages(next);
  } catch {
    return {
      ok: false,
      error: '本地存储已满或不可用，请删除部分已上传图片后重试',
    };
  }

  return { ok: true, item };
}

/**
 * 按 id 删除一条
 * @param {string} id - 记录 id
 */
export function removePlazaUserImage(id: string): void {
  const prev = loadPlazaUserImages();
  savePlazaUserImages(prev.filter((x) => x.id !== id));
}
