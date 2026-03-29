import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  /**
   * 当父级目录存在其它 lockfile 时，显式指定 Turbopack 根目录为本项目
   * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory
   */
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "p1.music.126.net", pathname: "/**" },
      { protocol: "https", hostname: "p2.music.126.net", pathname: "/**" },
      { protocol: "https", hostname: "p3.music.126.net", pathname: "/**" },
      { protocol: "https", hostname: "p4.music.126.net", pathname: "/**" },
      { protocol: "https", hostname: "p5.music.126.net", pathname: "/**" },
      { protocol: "https", hostname: "p6.music.126.net", pathname: "/**" },
    ],
  },
};

export default nextConfig;
