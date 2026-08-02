"use client";
import { useState, useMemo, useEffect, useDeferredValue } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { ReportMeta } from "@/types/report";

function formatDate(date: string): string {
  const d = new Date(date);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function getYearMonth(date: string): string {
  const d = new Date(date);
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col min-h-full">
      <div className="masthead">
        <div>
          <div className="masthead-issue">Archive</div>
          <h1>历史归档</h1>
        </div>
      </div>
      <div className="content">
        <div className="c-12">
          <div className="card">
            <div className="card-body" style={{ padding: "16px" }}>
              <div className="h-10 bg-[var(--bg-soft)] animate-pulse rounded" />
            </div>
          </div>
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div className="c-12" key={i}>
            <div className="card">
              <div className="card-body" style={{ padding: "20px" }}>
                <div className="h-4 w-24 bg-[var(--bg-soft)] animate-pulse rounded mb-3" />
                <div className="grid grid-cols-3 gap-1">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="h-16 bg-[var(--bg-soft)] animate-pulse rounded" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [allReports, setAllReports] = useState<ReportMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const deferredQuery = useDeferredValue(searchQuery);
  const reportsPerPage = 12;

  useEffect(() => {
    fetch("/data/reports-index.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setAllReports(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const totalCount = allReports.length;
  const filteredReports = useMemo(() => {
    if (!deferredQuery.trim()) return allReports;
    const q = deferredQuery.toLowerCase();
    return allReports.filter(r => r.date.toLowerCase().includes(q) || r.weekday.toLowerCase().includes(q) || r.title.toLowerCase().includes(q));
  }, [allReports, deferredQuery]);

  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);
  const paginatedReports = filteredReports.slice((currentPage - 1) * reportsPerPage, currentPage * reportsPerPage);
  const grouped = paginatedReports.reduce<Record<string, { reports: ReportMeta[] }>>((acc, r) => {
    const ym = getYearMonth(r.date);
    if (!acc[ym]) acc[ym] = { reports: [] };
    acc[ym].reports.push(r);
    return acc;
  }, {});
  const sortedGroups = Object.entries(grouped).sort(([a], [b]) => {
    const [aY, aM] = a.replace(/[年月]/g, m => m === "年" ? "-" : "").split("-").map(Number);
    const [bY, bM] = b.replace(/[年月]/g, m => m === "年" ? "-" : "").split("-").map(Number);
    return bY - aY || bM - aM;
  });

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="flex flex-col min-h-full">
      {/* Masthead */}
      <div className="masthead">
        <div>
          <div className="masthead-issue">Archive</div>
          <h1>历史归档</h1>
          <div className="masthead-meta">
            {error
              ? "数据加载失败"
              : `共 ${totalCount} 期日报`}
          </div>
        </div>
        <Link href="/" className="masthead-btn">← 返回首页</Link>
      </div>

      {/* 内容 */}
      <div className="content">
        {/* 搜索 */}
        <div className="c-12">
          <div className="card">
            <div className="card-body" style={{ padding: "16px" }}>
              <div style={{ position: "relative" }}>
                <Search
                  className="absolute"
                  style={{ left: "12px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "var(--ink-tertiary)" }}
                />
                <input
                  type="text"
                  placeholder="搜索日期、星期..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  style={{
                    width: "100%",
                    fontSize: "13px",
                    border: "1px solid var(--line)",
                    background: "var(--bg)",
                    padding: "10px 16px 10px 40px",
                    color: "var(--ink-primary)",
                    outline: "none",
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = "var(--ink-primary)"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "var(--line)"}
                />
              </div>
            </div>
          </div>
        </div>

        {error ? (
          <div className="c-12">
            <div className="card">
              <div className="card-body" style={{ textAlign: "center", padding: "64px 24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600 }}>数据加载失败</h3>
                <p className="text-[11px] mt-2" style={{ color: "var(--ink-tertiary)" }}>{error}</p>
              </div>
            </div>
          </div>
        ) : totalCount === 0 ? (
          <div className="c-12">
            <div className="card">
              <div className="card-body" style={{ textAlign: "center", padding: "64px 24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600 }}>暂无历史日报</h3>
              </div>
            </div>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="c-12">
            <div className="card">
              <div className="card-body" style={{ textAlign: "center", padding: "64px 24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600 }}>未找到匹配的日报</h3>
                <p className="text-[11px] mt-2" style={{ color: "var(--ink-tertiary)" }}>尝试使用不同的关键词搜索</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {sortedGroups.map(([yearMonth, group]) => (
              <div className="c-12" key={yearMonth}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="eyebrow">{yearMonth}</div>
                  <span className="text-[11px]" style={{ color: "var(--ink-tertiary)" }}>
                    ({group.reports.length} 期)
                  </span>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: "1px",
                    background: "var(--line-subtle)",
                  }}
                >
                  {group.reports.map((report) => (
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
                            <div className="flex items-center gap-2">
                              <span
                                style={{
                                  fontSize: "10px",
                                  fontWeight: 500,
                                  padding: "2px 6px",
                                  background: "var(--bg-soft)",
                                  color: "var(--ink-primary)",
                                }}
                              >
                                {report.date.split("-")[2]}日
                              </span>
                              <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--ink-primary)" }}>
                                {formatDate(report.date)}
                              </span>
                            </div>
                            <p className="text-[10px] mt-1.5" style={{ color: "var(--ink-tertiary)" }}>
                              星期{report.weekday}
                            </p>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {totalPages > 1 && (
              <div className="c-12">
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="source-btn"
                    style={{
                      height: "32px",
                      padding: "0 16px",
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      opacity: currentPage === 1 ? 0.3 : 1,
                    }}
                  >
                    ← 上一页
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        style={{
                          width: "32px",
                          height: "32px",
                          fontSize: "11px",
                          fontWeight: 500,
                          background: currentPage === page ? "var(--ink-primary)" : "var(--bg)",
                          color: currentPage === page ? "var(--bg)" : "var(--ink-secondary)",
                          border: "1px solid var(--line)",
                          cursor: "pointer",
                        }}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="source-btn"
                    style={{
                      height: "32px",
                      padding: "0 16px",
                      cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                      opacity: currentPage === totalPages ? 0.3 : 1,
                    }}
                  >
                    下一页 →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}