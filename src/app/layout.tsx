import type { Metadata, Viewport } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";

const notoSans = Noto_Sans({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-noto-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sơ Đồ Tư Duy | Mindmap PWA",
  description:
    "Ứng dụng sơ đồ tư duy cao cấp kết hợp quản lý tiến độ dự án. Hỗ trợ import/export MindGenius, tích hợp Google Gemini AI và Gantt Chart.",
  manifest: "/manifest.json",
  keywords: ["sơ đồ tư duy", "mindmap", "gantt chart", "quản lý dự án", "PWA"],
  authors: [{ name: "dinh-np" }],
  openGraph: {
    title: "Sơ Đồ Tư Duy | Mindmap PWA",
    description: "Ứng dụng sơ đồ tư duy cao cấp tích hợp AI và quản lý dự án",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0066AB",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={notoSans.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Sơ Đồ Tư Duy" />
      </head>
      <body className="antialiased pb-[env(safe-area-inset-bottom,16px)]">{children}</body>
    </html>
  );
}
