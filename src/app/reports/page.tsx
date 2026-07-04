"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronRight,
  FileText,
  Archive,
  Search,
  ChevronLeft,
} from "lucide-react";
import { getAllReports } from "@/lib/reports";
import type { ReportMeta } from "@/types/report";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 12;

  // Get all reports
  const allReports = useMemo(() => getAllReports(), []);
  const totalCount = allReports.length;

  // Filter reports based on search query
  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return allReports;
    
    const query = searchQuery.toLowerCase();
    return allReports.filter((report) => {
      const dateStr = report.date.toLowerCase();
      const weekday = report.weekday.toLowerCase();
      const title = report.title.toLowerCase();
      return (
        dateStr.includes(query) ||
        weekday.includes(query) ||
        title.includes(query)
      );
    });
  }, [allReports, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * reportsPerPage,
    currentPage * reportsPerPage
  );

  // Group reports by year and month
  const grouped = paginatedReports.reduce<
    Record<string, { year: number; month: number; reports: ReportMeta[] }>
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

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex-1">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors dark:text-gray-400 dark:hover:text-gray-100"
              >
                <ChevronRight className="h-4 w-4 rotate-180" />
                <span>返回首页</span>
              </Link>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Archive className="h-4 w-4" />
              <span>
                共 <strong className="text-gray-900 dark:text-gray-100">{totalCount}</strong> 期日报
              </span>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        {/* Search bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索日报日期、星期..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-blue-400"
            />
          </div>
        </div>

        {totalCount === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-20 text-center dark:border-gray-700">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              暂无历史日报
            </h3>
            <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
              日报数据将在首次生成后展示在这里
            </p>
          </div>
        ) : filteredReports.length === 0 ? (
          /* No search results */
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-20 text-center dark:border-gray-700">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              未找到匹配的日报
            </h3>
            <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
              尝试使用不同的关键词搜索
            </p>
          </div>
        ) : (
          <>
            {/* Report groups */}
            <div className="space-y-10">
              {sortedGroups.map(([yearMonth, group]) => (
                <section key={yearMonth}>
                  <div className="mb-4 flex items-center gap-3">
                    <CalendarDays className="h-5 w-5 text-blue-500" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {yearMonth}
                    </h2>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
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
                        <article className="rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-600">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                  {report.date.split("-")[2]}日
                                </span>
                                <h4 className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {formatDate(report.date)}
                                </h4>
                              </div>
                              <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                                星期{report.weekday}
                              </p>
                            </div>
                            <ChevronRight className="mt-1 h-4 w-4 flex-shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </article>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <ChevronLeft className="h-4 w-4" />
                  上一页
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? "bg-blue-600 text-white dark:bg-blue-500"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  下一页
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <footer className="mt-12 border-t border-gray-200 pt-6 pb-8 dark:border-gray-700">
          <div className="flex flex-col items-center gap-2 text-center text-xs text-gray-500 dark:text-gray-400">
            <p>一次能源·电力市场联合日报 · 历史归档</p>
            <p>数据来源：公开市场数据 · 仅供参考，不构成投资建议</p>
          </div>
        </footer>
      </main>
    </div>
  );
}