"use client";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ReportNavProps { prevDate: string | null; nextDate: string | null; currentDate: string; }
function formatDateShort(date: string): string { const [y, m, d] = date.split("-"); return `${parseInt(m)}月${parseInt(d)}日`; }

export default function ReportNav({ prevDate, nextDate, currentDate }: ReportNavProps) {
  return (
    <nav className="flex items-center justify-between gap-4 border-t border-border pt-6" aria-label="报告导航">
      <div className="flex-1 text-left">{prevDate ? (<Link href={`/reports/${prevDate}`}><div className="group cursor-pointer rounded-lg p-3 transition-colors hover:bg-muted"><span className="flex items-center gap-1 text-xs text-muted-foreground"><ChevronLeft className="h-3.5 w-3.5" />上一篇</span><span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">{formatDateShort(prevDate)}</span></div></Link>) : (<div className="cursor-not-allowed rounded-lg p-3 opacity-30"><span className="flex items-center gap-1 text-xs text-muted-foreground"><ChevronLeft className="h-3.5 w-3.5" />上一篇</span></div>)}</div>
      <div className="hidden text-center sm:block"><span className="text-xs text-muted-foreground">{formatDateShort(currentDate)}</span></div>
      <div className="flex-1 text-right">{nextDate ? (<Link href={`/reports/${nextDate}`}><div className="group cursor-pointer rounded-lg p-3 transition-colors hover:bg-muted"><span className="flex items-center justify-end gap-1 text-xs text-muted-foreground">下一篇<ChevronRight className="h-3.5 w-3.5" /></span><span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">{formatDateShort(nextDate)}</span></div></Link>) : (<div className="cursor-not-allowed rounded-lg p-3 opacity-30"><span className="flex items-center justify-end gap-1 text-xs text-muted-foreground">下一篇<ChevronRight className="h-3.5 w-3.5" /></span></div>)}</div>
    </nav>
  );
}
