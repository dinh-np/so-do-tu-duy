import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  // Tắt strict mode để tránh double render ảnh hưởng mind-elixir
  reactStrictMode: false,

  // Next.js 16 dùng Turbopack mặc định
  turbopack: {},
};

export default withPWA(nextConfig);
