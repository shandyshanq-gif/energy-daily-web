"use client";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ReportNavProps {
  prevDate: string | null;
  nextDate: string | null;
  currentDate: string;
}

function formatDateShort(date: string): string {
  const [_, m, d] = date.split("-");
  return `${parseInt(m)}月${parseInt(d)}日`;
}

export default function ReportNav({ prevDate, nextDate, currentDate }: ReportNavProps) {
  return (
    <nav
      className="flex items-center justify-between gap-4 border-t"
      style={{ paddingTop: '24px', borderColor: 'var(--line)' }}
      aria-label="报告导航"
    >
      <div className="flex-1 text-left">
        {prevDate ? (
          <Link href={`/reports/${prevDate}`} className="group block" style={{ padding: '12px' }}>
            <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--ink-tertiary)' }}>
              <ChevronLeft className="h-3.5 w-3.5" />上一篇
            </span>
            <span
              className="text-[13px] font-medium transition-colors group-hover:text-[var(--red)]"
              style={{ color: 'var(--ink-primary)' }}
            >
              {formatDateShort(prevDate)}
            </span>
          </Link>
        ) : (
          <div style={{ padding: '12px', opacity: '0.3' }}>
            <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--ink-tertiary)' }}>
              <ChevronLeft className="h-3.5 w-3.5" />上一篇
            </span>
          </div>
        )}
      </div>

      <div className="hidden text-center sm:block">
        <span className="text-[10px]" style={{ color: 'var(--ink-tertiary)' }}>
          {formatDateShort(currentDate)}
        </span>
      </div>

      <div className="flex-1 text-right">
        {nextDate ? (
          <Link href={`/reports/${nextDate}`} className="group block" style={{ padding: '12px' }}>
            <span className="flex items-center justify-end gap-1 text-[10px]" style={{ color: 'var(--ink-tertiary)' }}>
              下一篇<ChevronRight className="h-3.5 w-3.5" />
            </span>
            <span
              className="text-[13px] font-medium transition-colors group-hover:text-[var(--red)]"
              style={{ color: 'var(--ink-primary)' }}
            >
              {formatDateShort(nextDate)}
            </span>
          </Link>
        ) : (
          <div style={{ padding: '12px', opacity: '0.3' }}>
            <span className="flex items-center justify-end gap-1 text-[10px]" style={{ color: 'var(--ink-tertiary)' }}>
              下一篇<ChevronRight className="h-3.5 w-3.5" />
            </span>
          </div>
        )}
      </div>
    </nav>
  );
}
