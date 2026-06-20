import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "一次能源·电力市场联合日报",
  description:
    "专业能源数据平台 —— 提供原油、天然气、煤炭、电力市场的一站式行情监测、政策解读与数据分析服务",
  keywords: [
    "能源日报",
    "电力市场",
    "原油价格",
    "天然气",
    "煤炭",
    "电力现货",
    "能源数据",
  ],
  openGraph: {
    title: "一次能源·电力市场联合日报",
    description:
      "专业能源数据平台 —— 提供原油、天然气、煤炭、电力市场的一站式行情监测、政策解读与数据分析服务",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* 
          Dark mode via prefers-color-scheme media query (Tailwind v4 approach).
          No JS theme toggle needed at the HTML level — ThemeToggle component 
          handles it client-side.
        */}
      </head>
      <body className="min-h-full flex flex-col">
        <div className="flex min-h-screen flex-col">
          {/* Skip to main content link for a11y */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:p-4 focus:bg-background focus:text-foreground"
          >
            跳转到主要内容
          </a>
          {children}
        </div>
      </body>
    </html>
  );
}
