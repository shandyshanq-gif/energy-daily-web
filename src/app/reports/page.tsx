"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { CalendarDays, ChevronRight, FileText, Archive, Search, ChevronLeft, ArrowLeft } from "lucide-react";
import { getAllReports } from "@/lib/reports";
import type { ReportMeta } from "@/types/report";

function formatDate(date: string): string { const d = new Date(date); return `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`; }
function getYearMonth(date: string): { year: number; month: number; yearMonth: string } { const d = new Date(date); return { year: d.getFullYear(), month: d.getMonth()+1, yearMonth: `${d.getFullYear()}年${d.getMonth()+1}月` }; }

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 12;
  const allReports = useMemo(() => getAllReports(), []);
  const totalCount = allReports.length;
  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return allReports;
    const query = searchQuery.toLowerCase();
    return allReports.filter(r => r.date.toLowerCase().includes(query) || r.weekday.toLowerCase().includes(query) || r.title.toLowerCase().includes(query));
  }, [allReports, searchQuery]);
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);
  const paginatedReports = filteredReports.slice((currentPage-1)*reportsPerPage, currentPage*reportsPerPage);
  const grouped = paginatedReports.reduce<Record<string,{year:number;month:number;reports:ReportMeta[]}>>((acc,r)=>{const{year,month,yearMonth}=getYearMonth(r.date);if(!acc[yearMonth])acc[yearMonth]={year,month,reports:[]};acc[yearMonth].reports.push(r);return acc;},{});
  const sortedGroups = Object.entries(grouped).sort(([a],[b])=>{const[aY,aM]=a.replace(/[年月]/g,m=>m==="年"?"-":"").split("-").map(Number);const[bY,bM]=b.replace(/[年月]/g,m=>m==="年"?"-":"").split("-").map(Number);return bY-aY||bM-aM;});

  return (
    <div className="flex flex-col min-h-full">
      <div className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="h-4 w-4" /><span>返回首页</span></Link>
            <div className="h-4 w-px bg-border" /><h1 className="text-sm font-semibold text-foreground">历史归档</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Archive className="h-4 w-4" /><span>共 <strong className="text-foreground">{totalCount}</strong> 期日报</span></div>
        </div>
      </div>
      <div className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 py-8">
        <div className="mb-8"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="text" placeholder="搜索日报日期、星期..." value={searchQuery} onChange={e=>{setSearchQuery(e.target.value);setCurrentPage(1);}} className="w-full rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors" /></div></div>
        {totalCount===0?(
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center"><div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted"><FileText className="h-8 w-8 text-muted-foreground" /></div><h3 className="text-lg font-semibold">暂无历史日报</h3><p className="mt-2 max-w-md text-sm text-muted-foreground">日报数据将在首次生成后展示在这里</p></div>
        ):filteredReports.length===0?(
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center"><div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted"><Search className="h-8 w-8 text-muted-foreground" /></div><h3 className="text-lg font-semibold">未找到匹配的日报</h3><p className="mt-2 max-w-md text-sm text-muted-foreground">尝试使用不同的关键词搜索</p></div>
        ):(
          <>
            <div className="space-y-10">{sortedGroups.map(([yearMonth,group])=>(
              <section key={yearMonth}><div className="mb-4 flex items-center gap-3"><CalendarDays className="h-5 w-5 text-accent" /><h2 className="text-lg font-semibold text-foreground">{yearMonth}</h2><span className="text-sm text-muted-foreground">({group.reports.length} 期)</span></div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{group.reports.map(report=>(
                  <Link key={report.date} href={`/reports/${report.date}`} className="group block"><article className="rounded-lg border border-border bg-card p-4 transition-all hover:border-accent/40 hover:shadow-sm"><div className="flex items-start justify-between"><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="inline-flex items-center justify-center rounded bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">{report.date.split("-")[2]}日</span><h4 className="truncate text-sm font-medium text-foreground">{formatDate(report.date)}</h4></div><p className="mt-1.5 text-xs text-muted-foreground">星期{report.weekday}</p></div><ChevronRight className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" /></div></article></Link>
                ))}</div>
              </section>
            ))}</div>
            {totalPages>1&&(<div className="mt-10 flex items-center justify-center gap-2"><button onClick={()=>{setCurrentPage(currentPage-1);document.getElementById("main-content")?.scrollTo({top:0,behavior:"smooth"});}} disabled={currentPage===1} className="flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="h-4 w-4" />上一页</button><div className="flex items-center gap-1">{Array.from({length:totalPages},(_,i)=>i+1).map(page=>(<button key={page} onClick={()=>{setCurrentPage(page);document.getElementById("main-content")?.scrollTo({top:0,behavior:"smooth"});}} className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage===page?"bg-accent text-accent-foreground":"text-muted-foreground hover:bg-muted"}`}>{page}</button>))}</div><button onClick={()=>{setCurrentPage(currentPage+1);document.getElementById("main-content")?.scrollTo({top:0,behavior:"smooth"});}} disabled={currentPage===totalPages} className="flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40">下一页<ChevronRight className="h-4 w-4" /></button></div>)}
          </>
        )}
      </div>
    </div>
  );
}
