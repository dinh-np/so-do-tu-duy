import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tắt strict mode để tránh double render ảnh hưởng mind-elixir
  reactStrictMode: false,

  // Next.js 16 dùng Turbopack mặc định
  turbopack: {},
};

export default nextConfig;
