import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // PWA headers for offline-first
  async headers() {
    return [
      {
        source: "/manifest.json",
        headers: [
          { key: "Content-Type", value: "application/manifest+json" },
        ],
      },
    ];
  },
};

export default nextConfig;
