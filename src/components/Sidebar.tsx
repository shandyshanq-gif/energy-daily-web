"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, ChevronDown, ChevronRight, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ReportMeta } from "@/lib/reports";

interface SidebarProps {
  reports: ReportMeta[];
}

function groupReportsByMonth(
  reports: ReportMeta[]
): { month: string; reports: ReportMeta[] }[] {
  const groups: { month: string; reports: ReportMeta[] }[] = [];
  let currentMonth = "";
  let currentGroup: ReportMeta[] = [];

  for (const report of reports) {
    const month = report.date.substring(0, 7); // "YYYY-MM"
    const monthLabel = `${report.date.substring(0, 4)}年${parseInt(
      report.date.substring(5, 7)
    )}月`;

    if (month !== currentMonth) {
      if (currentGroup.length > 0) {
        groups.push({ month: currentMonth, reports: [...currentGroup] });
      }
      currentMonth = month;
      currentGroup = [report];
    } else {
      currentGroup.push(report);
    }
  }

  if (currentGroup.length > 0) {
    groups.push({ month: currentMonth, reports: currentGroup });
  }

  return groups;
}

function formatDateLabel(date: string, weekday: string): string {
  const [y, m, d] = date.split("-");
  return `${parseInt(m)}月${parseInt(d)}日 星期${weekday}`;
}

export default function Sidebar({ reports }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const [collapsedMonths, setCollapsedMonths] = React.useState<Set<string>>(
    new Set()
  );

  const groups = React.useMemo(() => groupReportsByMonth(reports), [reports]);

  const toggleMonth = (month: string) => {
    setCollapsedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(month)) {
        next.delete(month);
      } else {
        next.add(month);
      }
      return next;
    });
  };

  const currentDate = pathname.startsWith("/reports/")
    ? pathname.replace("/reports/", "")
    : null;

  const sidebarContent = (
    <nav className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <Link
          href="/"
          className="text-sm font-semibold text-gray-900 hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400"
          onClick={() => setIsOpen(false)}
        >
          首页
        </Link>
        <button
          type="button"
          className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-label="关闭菜单"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Report list */}
      <div className="flex-1 overflow-y-auto py-2">
        {groups.map((group) => {
          const isCollapsed = collapsedMonths.has(group.month);
          return (
            <div key={group.month} className="px-2">
              <button
                type="button"
                className="flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                onClick={() => toggleMonth(group.month)}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
                {group.reports[0].date.substring(0, 4)}年
                {parseInt(group.reports[0].date.substring(5, 7))}月
              </button>
              {!isCollapsed && (
                <div className="ml-1 mt-0.5 space-y-0.5 border-l border-gray-200 pl-3 dark:border-gray-700">
                  {group.reports.map((report) => {
                    const isActive = currentDate === report.date;
                    return (
                      <Link
                        key={report.date}
                        href={`/reports/${report.date}`}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "block rounded-md px-2 py-1.5 text-xs transition-colors",
                          isActive
                            ? "bg-blue-50 font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                        )}
                      >
                        {formatDateLabel(report.date, report.weekday)}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className="fixed left-4 top-3 z-40 rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 lg:hidden"
        onClick={() => setIsOpen(true)}
        aria-label="打开菜单"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile slide-over sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 transform bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-900 lg:static lg:z-auto lg:w-64 lg:translate-x-0 lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
