import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI PULSE｜每日人工智能情报站",
  description: "聚合全球 AI 官方动态、媒体、研究论文与 X 热门博主每日发言，自动保存资讯快照。",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "AI PULSE｜每日人工智能情报站",
    description: "一键获取全域 AI 资讯与 X 热门博主今日发言，自动归档，随时回看。",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "AI PULSE｜每日人工智能情报站", description: "一键获取全域 AI 资讯与 X 热门博主今日发言，自动归档，随时回看。" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}

