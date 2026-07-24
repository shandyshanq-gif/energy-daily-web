'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Archive, BarChart3, Link2 } from 'lucide-react';

const navigation = [
  { name: '首页', href: '/', icon: Home },
  { name: '历史日报', href: '/reports', icon: Archive },
  { name: '数据看板', href: '/dashboard', icon: BarChart3 },
  { name: '信息渠道', href: '/link', icon: Link2 },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside
      className="hidden md:flex flex-shrink-0 flex-col border-r"
      style={{ width: '180px', background: 'var(--bg)', borderColor: 'var(--line)' }}
    >
      <div
        className="flex items-center"
        style={{
          height: '44px',
          borderBottom: '1px solid var(--line)',
          padding: '0 16px',
        }}
      >
        <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--ink-tertiary)]">
          导航
        </span>
      </div>
      <nav className="flex-1" style={{ padding: '12px' }}>
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 transition-colors"
              style={{
                padding: '10px 12px',
                marginBottom: '2px',
                fontSize: '13px',
                fontWeight: '500',
                color: isActive ? 'var(--bg)' : 'var(--ink-secondary)',
                background: isActive ? 'var(--ink-primary)' : 'transparent',
              }}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
