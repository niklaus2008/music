import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
