import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  FileText,
  Archive,
} from "lucide-react";
import { getAllReports } from "@/lib/reports";

function formatDate(date: string): string {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}年${m}月${day}日`;
}

function getYearMonth(date: string): { year: number; month: number; yearMonth: string } {
  const d = new Date(date);
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    yearMonth: `${d.getFullYear()}年${d.getMonth() + 1}月`,
  };
}

export default function ReportsPage() {
  const allReports = getAllReports();
  const totalCount = allReports.length;

  // Group reports by year and month
  const grouped = allReports.reduce<
    Record<string, { year: number; month: number; reports: typeof allReports }>
  >((acc, report) => {
    const { year, month, yearMonth } = getYearMonth(report.date);
    if (!acc[yearMonth]) {
      acc[yearMonth] = { year, month, reports: [] };
    }
    acc[yearMonth].reports.push(report);
    return acc;
  }, {});

  // Sort groups by year/month descending
  const sortedGroups = Object.entries(grouped).sort(([aKey], [bKey]) => {
    const [aY, aM] = aKey.replace(/[年月]/g, (m) => (m === "年" ? "-" : "")).split("-").map(Number);
    const [bY, bM] = bKey.replace(/[年月]/g, (m) => (m === "年" ? "-" : "")).split("-").map(Number);
    return bY - aY || bM - aM;
  });

  return (
    <div className="flex-1">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
                <span>返回首页</span>
              </Link>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Archive className="h-4 w-4" />
              <span>
                共 <strong className="text-foreground">{totalCount}</strong> 期日报
              </span>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        {totalCount === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">暂无历史日报</h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              日报数据将在首次生成后展示在这里
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {sortedGroups.map(([yearMonth, group]) => (
              <section key={yearMonth}>
                <div className="mb-4 flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-accent" />
                  <h2 className="text-lg font-semibold">{yearMonth}</h2>
                  <span className="text-sm text-muted-foreground">
                    ({group.reports.length} 期)
                  </span>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {group.reports.map((report) => (
                    <Link
                      key={report.date}
                      href={`/reports/${report.date}`}
                      className="group block"
                    >
                      <article className="rounded-lg border border-border bg-card p-4 transition-all hover:border-accent/40 hover:shadow-sm">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center justify-center rounded bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                                {report.date.split("-")[2]}日
                              </span>
                              <h4 className="text-sm font-medium truncate">
                                {formatDate(report.date)}
                              </h4>
                            </div>
                            <p className="mt-1.5 text-xs text-muted-foreground">
                              星期{report.weekday}
                            </p>
                          </div>
                          <ChevronRight className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 border-t border-border pt-6 pb-8">
          <div className="flex flex-col items-center gap-2 text-center text-xs text-muted-foreground">
            <p>一次能源·电力市场联合日报 · 历史归档</p>
            <p>数据来源：公开市场数据 · 仅供参考，不构成投资建议</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
