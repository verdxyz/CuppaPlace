// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "cuppaplace.web.id", pathname: "/uploads/**" },
      { protocol: "https", hostname: "www.cuppaplace.web.id", pathname: "/uploads/**" },

      
      { protocol: "http", hostname: "cuppaplace.web.id", pathname: "/uploads/**" },
      { protocol: "http", hostname: "www.cuppaplace.web.id", pathname: "/uploads/**" },

      
      { protocol: "http", hostname: "localhost", port: "4010", pathname: "/uploads/**" },
      { protocol: "http", hostname: "127.0.0.1", port: "4010", pathname: "/uploads/**" },
    ],
  },
};

export default nextConfig;
