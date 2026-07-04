// 侧边栏组件

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navigation = [
  { name: '首页', href: '/' },
  { name: '历史日报', href: '/reports' },
  { name: '相关链接', href: '/link' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden w-full flex-col md:flex md:w-64 md:border-r">
      <div className="flex flex-col space-y-3 p-4">
        <h3 className="font-semibold">导航</h3>
        <nav className="flex flex-col space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}