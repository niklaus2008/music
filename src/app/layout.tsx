import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LyricCanvas - 歌词美学重塑',
  description: '将歌词转化为具有设计感、排版美学和传播价值的可视化图片',
};

/**
 * 根布局
 * 字体通过 globals.css 中的 @font-face 加载（CDN 托管的开源中文字体）
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
