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

**2026-04-02**：手账本模板下不再同时渲染默认页眉/正文/页脚，避免与双页手写区叠字；根容器增加 `relative` 以正确定位双页层；左页歌词行与通用横排一致处理断行（`isBreak`）；金句无选中时在左页显示提示文案。

**2026-04-02（续）**：`selectSong` 在歌词接口返回后校验 `currentSong.id`，避免快速切歌时旧请求覆盖新歌歌词；手账本右页去掉硬编码「特别的人」示例文案，改为与当前解析歌词首句一致（无则歌名）；左页歌词行 `key` 含歌曲 id，避免列表复用导致串行。

**2026-04-02（续 2）**：手账本左页将 `justify-center` 改为 `justify-start` 并加 `min-h-0`，避免纵向溢出时 Flex 居中导致卷动区域顶端仍看不到歌词开头（表现为缺前两行）。

**2026-04-02（续 3）**：非 A4 导出时根节点 `height:auto` 下手账本 `absolute` 子树不占流，`scrollHeight` 过小导致下载图成细条；画布统一 `minHeight: ch`，且 `exportImage` 在截图前将手账本双页改为流式并展开左栏滚动区，使整图包含完整歌词。
