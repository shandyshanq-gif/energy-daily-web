import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Footer } from "@/components/layout/footer";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "一次能源·电力市场联合日报",
  description: "专业能源数据平台 —— 原油、天然气、煤炭、电力市场一站式行情监测",
  keywords: ["能源日报", "电力市场", "原油价格", "天然气", "煤炭", "电力现货"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head />
      <body className="h-full overflow-hidden flex flex-col">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:p-4 focus:bg-background focus:text-foreground">
          跳转到主要内容
        </a>
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main id="main-content" className="flex-1 overflow-y-auto">
            {children}
            <Footer />
          </main>
        </div>
      </body>
    </html>
  );
}
