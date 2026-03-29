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
| `NETEASE_API_URL` | 可选。网易云音乐 API 代理根地址（默认使用内置公开部署，生产环境建议自建） |

复制示例：`cp .env.example .env.local` 后按需填写。

## 目录说明

- `src/app`：页面与路由（`/` 搜索、`/editor` 编辑器）
- `src/app/api`：`/api/search`、`/api/song`、`/api/lyric` 服务端代理
- `src/lib`、`src/store`、`src/types`：业务逻辑与状态
- `docs/PLAN.md`：产品与技术方案与变更记录

## 变更说明

详细变更见 `docs/PLAN.md` 第七节「变更记录」。
