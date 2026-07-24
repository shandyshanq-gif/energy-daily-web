'use client';
import Link from 'next/link';
import ThemeToggle from '@/components/report/ThemeToggle';

export function Header() {
  return (
    <header
      className="sticky top-0 z-50 w-full border-b"
      style={{
        height: '44px',
        background: 'var(--bg)',
        borderColor: 'var(--line)',
      }}
    >
      <div
        className="flex h-full items-center justify-between mx-auto"
        style={{ maxWidth: '1240px', padding: '0 24px' }}
      >
        <Link href="/" className="flex items-center gap-3 group">
          <span
            className="block"
            style={{ width: '3px', height: '18px', background: 'var(--red)' }}
          />
          <span className="text-[11px] font-semibold">能源日报</span>
        </Link>

        <nav className="flex items-center gap-6 text-[11px] text-[var(--ink-secondary)]">
          <Link href="/" className="hover:text-[var(--red)] transition-colors">首页</Link>
          <Link href="/reports" className="hover:text-[var(--red)] transition-colors">历史日报</Link>
          <Link href="/dashboard" className="hover:text-[var(--red)] transition-colors">数据看板</Link>
          <Link href="/link" className="hover:text-[var(--red)] transition-colors">信息渠道</Link>
        </nav>

        <ThemeToggle />
      </div>
    </header>
  );
}
