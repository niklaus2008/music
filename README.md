# LyricCanvas

歌词美学重塑工具：搜索歌曲 → 选择模板与比例 → 实时预览 → 导出图片（免费带水印 / 高清付费待接入）。

## 技术栈

Next.js 16（App Router）、React 19、Tailwind CSS 4、shadcn/ui、Zustand、html-to-image。

## 本地开发

```bash
pnpm install
pnpm dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。

## 构建

```bash
pnpm build
pnpm start
```

## 环境变量

| 变量 | 说明 |
|------|------|
| `NETEASE_API_URL` | 可选。不设时由服务端直连 `music.163.com` 公开接口；若需 [Binaryify](https://github.com/Binaryify/NeteaseCloudMusicApi) 自建代理，填其根地址（如 `http://127.0.0.1:3000`） |

复制示例：`cp .env.example .env.local` 后按需填写。

## 目录说明

- `src/app`：页面与路由（`/` 搜索、`/editor` 编辑器）
- `src/app/api`：`/api/search`、`/api/song`、`/api/lyric` 服务端代理
- `src/lib`、`src/store`、`src/types`：业务逻辑与状态
- `docs/PLAN.md`：产品与技术方案与变更记录

## 变更说明

详细变更见 `docs/PLAN.md` 第七节「变更记录」。

**2026-03-30**：搜索页空状态引导与响应式安全区；预览/导出画布增加「网易云音乐」来源版权说明；导出模块注释与基准尺寸说明对齐 `CANVAS_SIZE`。同日：编辑器小屏底部固定栏与「样式与导出」底部抽屉，控制区抽为 `EditorControlsPanel` 与桌面侧栏复用。

**2026-03-30（续）**：默认网易云数据源改为直连官网接口，避免已失效的第三方 Vercel 演示地址导致搜索 500；仍可通过 `NETEASE_API_URL` 使用自建代理。同日：搜索结果封面 URL 规范为 https，并放宽 `images.remotePatterns`，修复 `next/image` 报未配置主机名。

**2026-03-30（续 2）**：本地 `pnpm dev` 时，编辑器「高清下载」弹窗内可「试跑高清导出」以验证付费档（无水印、高倍率）；`pnpm build` / 线上不包含该入口。

**2026-03-30（续 3）**：输出比例为 A4 时，导出按单页高度对歌词块分页；超过一页时自动打包为 ZIP（每页一张 PNG），单页仍为单张 PNG。实现见 `src/lib/export.ts`、`src/lib/zip-store.ts`。
