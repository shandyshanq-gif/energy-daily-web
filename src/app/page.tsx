import Link from "next/link";
import { CalendarDays, Newspaper, TrendingUp, ChevronRight, BarChart3, FileText } from "lucide-react";
import { getAllReports } from "@/lib/reports";
import { extractDateLine, extractSubtitle } from "@/lib/markdown";
import { formatDate } from "@/lib/utils";

export default function HomePage() {
  const allReports = getAllReports();
  const latest = allReports.length > 0 ? { meta: allReports[0], content: "" } : null;
  const recentReports = latest ? allReports.filter((r) => r.date !== latest.meta.date).slice(0, 9) : allReports.slice(0, 9);
  const reportCount = allReports.length;

  return (
    <div className="flex flex-col min-h-full">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">能源日报</h1>
              <p className="mt-1 text-sm text-muted-foreground">一次能源·电力市场联合日报</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>共 <strong className="text-foreground">{reportCount}</strong> 期</span>
            </div>
          </div>
          {latest ? (
            <Link href={`/reports/${latest.meta.date}`} className="group block">
              <article className="relative overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-accent/40 hover:shadow-md">
                <div className="h-1.5 bg-accent" />
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-accent" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-accent">最新日报</span>
                      </div>
                      <h3 className="text-xl font-bold leading-tight tracking-tight sm:text-2xl">{latest.meta.title}</h3>
                      <p className="mt-2 text-base text-muted-foreground">{formatDate(latest.meta.date)} 星期{latest.meta.weekday}</p>
                    </div>
                    <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                      <FileText className="h-7 w-7 text-accent" />
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[{ label: "原油", value: "WTI / Brent" },{ label: "天然气", value: "JKM / LNG" },{ label: "煤炭", value: "动力煤" },{ label: "电力", value: "现货市场" }].map((stat) => (
                      <div key={stat.label} className="rounded-lg bg-muted px-3 py-2 text-center">
                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                        <div className="text-sm font-medium">{stat.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 flex items-center gap-1 text-sm font-medium text-accent">阅读全文 <ChevronRight className="h-4 w-4" /></div>
                </div>
              </article>
            </Link>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted"><Newspaper className="h-8 w-8 text-muted-foreground" /></div>
              <h3 className="text-lg font-semibold">暂无日报数据</h3>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">等待数据源接入后，这里将展示最新的一次能源·电力市场联合日报</p>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 py-8">
        {recentReports.length > 0 && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground"><CalendarDays className="h-4 w-4" />往期日报</h2>
              <Link href="/reports" className="flex items-center gap-1 text-sm font-medium text-accent hover:underline">查看全部历史<ChevronRight className="h-4 w-4" /></Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recentReports.map((report) => (
                <Link key={report.date} href={`/reports/${report.date}`} className="group block">
                  <article className="rounded-lg border border-border bg-card p-4 transition-all hover:border-accent/40 hover:shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium truncate">{formatDate(report.date)}</h4>
                        <p className="mt-0.5 text-xs text-muted-foreground">星期{report.weekday}</p>
                      </div>
                      <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
