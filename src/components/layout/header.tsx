// 头部组件

'use client';

import Link from 'next/link';
import { useTheme } from '@/hooks/useTheme';
import ThemeToggle from '@/components/report/ThemeToggle';

export function Header() {
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span className="hidden font-bold sm:inline-block">
              能源日报系统
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              首页
            </Link>
            <Link
              href="/reports"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              历史日报
            </Link>
            <Link
              href="/link"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              相关链接
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* 搜索框可以在这里添加 */}
          </div>
          <nav className="flex items-center">
            {mounted && (
              <ThemeToggle />
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}