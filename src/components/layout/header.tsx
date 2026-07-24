'use client';
import Link from 'next/link';
import { BarChart3 } from 'lucide-react';
import ThemeToggle from '@/components/report/ThemeToggle';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors group-hover:bg-accent/90">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-semibold tracking-tight text-foreground">能源日报</span>
              <p className="text-[11px] leading-tight text-muted-foreground">一次能源·电力市场联合日报</p>
            </div>
          </Link>
        </div>
        <nav className="flex items-center gap-1">
          <Link href="/" className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent">首页</Link>
          <Link href="/reports" className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent">历史日报</Link>
          <Link href="/dashboard" className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent">数据看板</Link>
          <Link href="/link" className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent">信息渠道</Link>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
