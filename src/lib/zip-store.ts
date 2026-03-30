/**
 * @fileoverview 浏览器端 ZIP 打包（STORE / 无压缩）
 * 用于将多张 PNG 合并为一个 zip 触发下载，避免引入额外运行时依赖。
 */

/**
 * 生成 CRC32 查找表
 * @returns {Uint32Array} 256 项表
 */
function makeCrc32Table(): Uint32Array {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
}

const CRC_TABLE = makeCrc32Table();

/**
 * 计算字节数组的 CRC32（ZIP 使用）
 * @param {Uint8Array} bytes - 原始数据
 * @returns {number} CRC32
 */
function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c = (c >>> 8) ^ CRC_TABLE[(c ^ bytes[i]) & 0xff];
  }
  return (c ^ 0xffffffff) >>> 0;
}

/**
 * 拼接多个 Uint8Array
 * @param {Uint8Array[]} parts - 片段
 * @returns {Uint8Array} 合并结果
 */
function concatParts(parts: Uint8Array[]): Uint8Array {
  const len = parts.reduce((s, p) => s + p.length, 0);
  const out = new Uint8Array(len);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

/**
 * 写入本地文件头（无压缩）
 * @param {Uint8Array} nameBytes - UTF-8 文件名
 * @param {number} crcVal - CRC32
 * @param {number} size - 未压缩大小
 * @returns {Uint8Array} 头 + 文件名
 */
function localFileHeader(
  nameBytes: Uint8Array,
  crcVal: number,
  size: number
): Uint8Array {
  const buf = new Uint8Array(30 + nameBytes.length);
  const dv = new DataView(buf.buffer);
  let o = 0;
  dv.setUint32(o, 0x04034b50, true);
  o += 4;
  dv.setUint16(o, 20, true);
  o += 2;
  dv.setUint16(o, 0, true);
  o += 2;
  dv.setUint16(o, 0, true);
  o += 2;
  dv.setUint16(o, 0, true);
  o += 2;
  dv.setUint16(o, 0, true);
  o += 2;
  dv.setUint32(o, crcVal, true);
  o += 4;
  dv.setUint32(o, size, true);
  o += 4;
  dv.setUint32(o, size, true);
  o += 4;
  dv.setUint16(o, nameBytes.length, true);
  o += 2;
  dv.setUint16(o, 0, true);
  o += 2;
  buf.set(nameBytes, 30);
  return buf;
}

/**
 * 写入中央目录项
 * @param {Uint8Array} nameBytes - UTF-8 文件名
 * @param {number} crcVal - CRC32
 * @param {number} size - 大小
 * @param {number} localOffset - 本地头在 zip 中的偏移
 * @returns {Uint8Array} 中央目录记录
 */
function centralFileHeader(
  nameBytes: Uint8Array,
  crcVal: number,
  size: number,
  localOffset: number
): Uint8Array {
  const buf = new Uint8Array(46 + nameBytes.length);
  const dv = new DataView(buf.buffer);
  let o = 0;
  dv.setUint32(o, 0x02014b50, true);
  o += 4;
  dv.setUint16(o, 0x0314, true);
  o += 2;
  dv.setUint16(o, 20, true);
  o += 2;
  dv.setUint16(o, 0, true);
  o += 2;
  dv.setUint16(o, 0, true);
  o += 2;
  dv.setUint16(o, 0, true);
  o += 2;
  dv.setUint16(o, 0, true);
  o += 2;
  dv.setUint32(o, crcVal, true);
  o += 4;
  dv.setUint32(o, size, true);
  o += 4;
  dv.setUint32(o, size, true);
  o += 4;
  dv.setUint16(o, nameBytes.length, true);
  o += 2;
  dv.setUint16(o, 0, true);
  o += 2;
  dv.setUint16(o, 0, true);
  o += 2;
  dv.setUint16(o, 0, true);
  o += 2;
  dv.setUint16(o, 0, true);
  o += 2;
  dv.setUint32(o, 0, true);
  o += 4;
  dv.setUint32(o, localOffset, true);
  o += 4;
  buf.set(nameBytes, 46);
  return buf;
}

/**
 * 写入 EOCD
 * @param {number} fileCount - 文件数
 * @param {number} centralSize - 中央目录总字节数
 * @param {number} centralOffset - 中央目录起始偏移
 * @returns {Uint8Array} EOCD
 */
function endOfCentralDirectory(
  fileCount: number,
  centralSize: number,
  centralOffset: number
): Uint8Array {
  const buf = new Uint8Array(22);
  const dv = new DataView(buf.buffer);
  let o = 0;
  dv.setUint32(o, 0x06054b50, true);
  o += 4;
  dv.setUint16(o, 0, true);
  o += 2;
  dv.setUint16(o, 0, true);
  o += 2;
  dv.setUint16(o, fileCount, true);
  o += 2;
  dv.setUint16(o, fileCount, true);
  o += 2;
  dv.setUint32(o, centralSize, true);
  o += 4;
  dv.setUint32(o, centralOffset, true);
  o += 4;
  dv.setUint16(o, 0, true);
  o += 2;
  return buf;
}

export interface ZipStoreEntry {
  /** zip 内相对路径（建议仅 ASCII / 数字） */
  name: string;
  /** 文件二进制 */
  blob: Blob;
}

/**
 * 将多个 Blob 打包为 ZIP（STORE），返回 Blob 供下载
 * @param {ZipStoreEntry[]} entries - 文件列表
 * @returns {Promise<Blob>} application/zip
 */
export async function zipBlobsStore(entries: ZipStoreEntry[]): Promise<Blob> {
  const enc = new TextEncoder();
  const bodyParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const { name, blob } of entries) {
    const data = new Uint8Array(await blob.arrayBuffer());
    const nameBytes = enc.encode(name);
    const crcVal = crc32(data);
    const local = localFileHeader(nameBytes, crcVal, data.length);
    bodyParts.push(local);
    offset += local.length;
    const localHeaderOffset = offset - local.length;
    bodyParts.push(data);
    offset += data.length;
    centralParts.push(
      centralFileHeader(nameBytes, crcVal, data.length, localHeaderOffset)
    );
  }

  const centralBytes = concatParts(centralParts);
  const centralOffset = offset;
  const centralSize = centralBytes.length;
  const eocd = endOfCentralDirectory(
    entries.length,
    centralSize,
    centralOffset
  );

  const all = concatParts([
    concatParts(bodyParts),
    centralBytes,
    eocd,
  ]);

  // 使用 slice 创建新 ArrayBuffer 避免类型问题
  return new Blob([all.slice(0).buffer], { type: 'application/zip' });
}
