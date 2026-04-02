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

- `src/app`：页面与路由（`/` 搜索与榜单与灵感 Tab、`/inspiration` 灵感广场、`/editor` 编辑器）
- `src/data/inspiration.json`：灵感墙静态示例（可改条目、换图 URL、关联 `songId` 与模板字段）
- `public/backgrounds/`：编辑器内置底图 PNG（新增/替换后同步 `src/lib/default-backgrounds.ts`）
- `src/app/api`：`/api/search`、`/api/song`、`/api/lyric` 服务端代理
- `src/lib`、`src/store`、`src/types`：业务逻辑与状态
- `docs/PLAN.md`：产品与技术方案与变更记录

## 变更说明

详细变更见 `docs/PLAN.md` 第七节「变更记录」。

**2026-03-30**：搜索页空状态引导与响应式安全区；预览/导出画布增加「网易云音乐」来源版权说明；导出模块注释与基准尺寸说明对齐 `CANVAS_SIZE`。同日：编辑器小屏底部固定栏与「样式与导出」底部抽屉，控制区抽为 `EditorControlsPanel` 与桌面侧栏复用。

**2026-03-30（续）**：默认网易云数据源改为直连官网接口，避免已失效的第三方 Vercel 演示地址导致搜索 500；仍可通过 `NETEASE_API_URL` 使用自建代理。同日：搜索结果封面 URL 规范为 https，并放宽 `images.remotePatterns`，修复 `next/image` 报未配置主机名。

**2026-03-30（续 2）**：本地 `pnpm dev` 时，编辑器「高清下载」弹窗内可「试跑高清导出」以验证付费档（无水印、高倍率）；`pnpm build` / 线上不包含该入口。

**2026-03-30（续 3）**：输出比例为 A4 时，导出按单页高度对歌词块分页；超过一页时自动打包为 ZIP（每页一张 PNG），单页仍为单张 PNG。实现见 `src/lib/export.ts`、`src/lib/zip-store.ts`。

**2026-04-02**：手账本模板下不再同时渲染默认页眉/正文/页脚，避免与双页手写区叠字；根容器增加 `relative` 以正确定位双页层；左页歌词行与通用横排一致处理断行（`isBreak`）；金句无选中时在左页显示提示文案。

**2026-04-02（续）**：`selectSong` 在歌词接口返回后校验 `currentSong.id`，避免快速切歌时旧请求覆盖新歌歌词；手账本右页去掉硬编码「特别的人」示例文案，改为与当前解析歌词首句一致（无则歌名）；左页歌词行 `key` 含歌曲 id，避免列表复用导致串行。

**2026-04-02（续 2）**：手账本左页将 `justify-center` 改为 `justify-start` 并加 `min-h-0`，避免纵向溢出时 Flex 居中导致卷动区域顶端仍看不到歌词开头（表现为缺前两行）。

**2026-04-02（续 3）**：非 A4 导出时根节点 `height:auto` 下手账本 `absolute` 子树不占流，`scrollHeight` 过小导致下载图成细条；画布统一 `minHeight: ch`，且 `exportImage` 在截图前将手账本双页改为流式并展开左栏滚动区，使整图包含完整歌词。

**2026-04-02（续 4）**：编辑器支持「自定义背景」：上传本地图片作为画布底图（`URL.createObjectURL`），歌词叠于其上，适用于所有风格模板；侧栏可清除背景；离开编辑器页时自动 `revoke` 释放。状态见 `editor-store` 的 `customBackgroundUrl` / `setCustomBackgroundFromFile`。

**2026-04-02（续 5）**：导出前将自定义背景的 `blob:` URL 转为 `data:` 写入画布根节点内联样式，避免 html-to-image 克隆时无法栅格化 blob 背景导致下载图无底图。

**2026-04-02（续 6）**：新增灵感墙：首页 Tab「灵感」与独立路由 `/inspiration` 共用 `InspirationWall`；数据为 `src/data/inspiration.json`；点击卡片先弹窗预览大图，「做同款」时请求 `/api/song` 后 `selectSong` 并套用模板/比例/金句行再进 `/editor`；无 `songId` 的条目仅展示；`next.config` 增加 `picsum.photos` 远程图域名。

**2026-04-02（续 7）**：编辑器「自定义背景」增加 9 张内置底图（`public/backgrounds/preset-01.png` … `preset-09.png`，列表见 `src/lib/default-backgrounds.ts`）；`editor-store` 新增 `setCustomBackgroundUrl`，仅对 `blob:` 做 `revoke`；导出时将站内路径背景 `fetch` 后转 data URL 写入画布，与 blob 背景一致。

**2026-04-02（续 8）**：编辑器增加「歌词主色」「副标题/说明色」：`lyricColor` / `metaColor` 存于 `editor-store`，切换模板时恢复为跟随模板；`LyricCanvas` 主文案区、手账本歌词区、竖排等与该色一致；`src/lib/lyric-color-presets.ts` 提供快捷色板与原生取色器。

**2026-04-02（续 9）**：「内置底图」改为可折叠：默认收起，点击「内置底图」行与下拉箭头展开 3×3 网格。

**2026-04-02（续 10）**：灵感墙「做同款」时将条目 `previewUrl` 写入 `customBackgroundUrl`，编辑画布与弹窗大图一致（此前误清空自定义背景导致仅见模板底）。
