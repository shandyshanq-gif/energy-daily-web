'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
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
    <aside className="hidden w-56 flex-shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="flex h-14 items-center border-b border-border px-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">导航菜单</span>
      </div>
      <nav className="flex-1 space-y-0.5 p-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}
              className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground hover:bg-accent/10 hover:text-foreground")}>
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        <p className="text-[11px] leading-relaxed text-muted-foreground">数据来源：公开市场数据<br />仅供参考，不构成投资建议</p>
      </div>
    </aside>
  );
}
