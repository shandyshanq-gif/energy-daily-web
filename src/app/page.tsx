import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getAllReports } from "@/lib/reports";
import { formatDate } from "@/lib/utils";

export default function HomePage() {
  const allReports = getAllReports();
  const latest = allReports.length > 0 ? allReports[0] : null;
  const recentReports = latest ? allReports.filter(r => r.date !== latest.date).slice(0, 9) : allReports.slice(0, 9);
  const reportCount = allReports.length;

  return (
    <div className="flex flex-col min-h-full">
      {/* Masthead */}
      <div className="masthead">
        <div>
          <div className="masthead-issue">Energy Daily Report</div>
          <h1>能源日报</h1>
          <div className="masthead-meta">一次能源·电力市场联合日报</div>
        </div>
        <a href="/dashboard" className="masthead-btn">↗ 数据看板</a>
      </div>

      {/* 内容 */}
      <div className="content">
        {/* 最新一期 */}
        <div className="c-12">
          {latest ? (
            <div className="card">
              <div className="card-head">
                <span className="card-eyebrow">最新日报</span>
                <span className="card-head-right">Latest Report</span>
              </div>
              <Link href={`/reports/${latest.date}`} className="block">
                <div style={{ padding: "32px" }}>
                  <div className="eyebrow" style={{ marginBottom: "8px" }}>
                    {formatDate(latest.date)} · 星期{latest.weekday}
                  </div>
                  <h2 style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.015em", lineHeight: 1.2 }}>
                    {latest.title}
                  </h2>
                  <div
                    style={{
                      marginTop: "24px",
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: "1px",
                      background: "var(--line-subtle)",
                    }}
                  >
                    {[
                      { label: "原油", value: "WTI / Brent" },
                      { label: "天然气", value: "JKM / TTF / HH" },
                      { label: "煤炭", value: "CCTD 7 品种" },
                      { label: "电力", value: "现货市场" },
                    ].map((stat) => (
                      <div key={stat.label} style={{ background: "var(--bg)", padding: "16px" }}>
                        <div className="price-label">{stat.label}</div>
                        <div className="price-value" style={{ fontSize: "16px", marginTop: "4px" }}>{stat.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-medium" style={{ marginTop: "20px", color: "var(--red)" }}>
                    阅读全文 <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            </div>
          ) : (
            <div className="card">
              <div className="card-body" style={{ textAlign: "center", padding: "64px 24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600 }}>暂无日报数据</h3>
                <p className="text-[11px] mt-2" style={{ color: "var(--ink-tertiary)" }}>
                  等待数据源接入后，这里将展示最新日报
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 往期 */}
        {recentReports.length > 0 && (
          <div className="c-12">
            <div className="flex items-center justify-between mb-4">
              <div className="eyebrow">往期日报</div>
              <Link
                href="/reports"
                className="flex items-center gap-1 text-[11px] font-medium transition-colors"
                style={{ color: "var(--red)" }}
              >
                查看全部历史 <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: "1px",
                background: "var(--line-subtle)",
              }}
            >
              {recentReports.map((report) => (
                <Link key={report.date} href={`/reports/${report.date}`} className="group block">
                  <article
                    style={{
                      background: "var(--bg)",
                      padding: "16px",
                      transition: "background 0.15s",
                    }}
                    className="hover:bg-[var(--bg-soft)]"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 style={{ fontSize: "13px", fontWeight: 500, color: "var(--ink-primary)" }}>
                          {formatDate(report.date)}
                        </h4>
                        <p className="text-[10px] mt-1" style={{ color: "var(--ink-tertiary)" }}>
                          星期{report.weekday}
                        </p>
                      </div>
                      <ChevronRight
                        className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                        style={{ color: "var(--ink-tertiary)" }}
                      />
                    </div>
                  </article>
                </Link>
              ))}
            </div>
            <div
              className="text-center text-[10px] mt-4"
              style={{ color: "var(--ink-tertiary)" }}
            >
              共 {reportCount} 期日报 · 数据来源公开市场
            </div>
          </div>
        )}
      </div>
    </div>
  );
}