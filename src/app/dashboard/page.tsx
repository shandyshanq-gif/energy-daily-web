// 数据看板 — 历史价格可视化

import Link from "next/link";
import { ArrowLeft, BarChart3, TrendingUp } from "lucide-react";
import { getAllPriceSeries, type PriceSeries } from "@/lib/price-history";
import PriceTrendChart from "@/components/charts/PriceTrendChart";

// ─── Static generation ────────────────────────────────────────────────
// Data is derived from report files, regenerated on each build
export const dynamic = "force-static";

export default function DashboardPage() {
  const allSeries = getAllPriceSeries();

  // Group by category
  const categories = ["原油", "天然气", "煤炭"];
  const grouped = categories.reduce<Record<string, PriceSeries[]>>((acc, cat) => {
    acc[cat] = allSeries.filter((s) => s.category === cat);
    return acc;
  }, {});

  const totalDataPoints = allSeries.reduce((sum, s) => sum + s.data.length, 0);
  const totalSeries = allSeries.length;

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Top navigation ── */}
      <div className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">返回首页</span>
            </Link>
            <div className="h-4 w-px bg-border" />
            <h1 className="text-sm font-semibold text-foreground">数据看板</h1>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{totalSeries} 个价格序列</span>
            <span className="text-border">·</span>
            <span>{totalDataPoints} 个数据点</span>
          </div>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 py-8">
        {/* Page intro */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <BarChart3 className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                历史价格数据看板
              </h2>
              <p className="text-sm text-muted-foreground">
                基于日报沉淀数据自动生成 · 每期日报更新后自动同步
              </p>
            </div>
          </div>
        </div>

        {allSeries.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">暂无足够的历史数据</h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              需要至少 2 期日报才能生成价格趋势图。请等待更多日报数据沉淀。
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {categories.map((cat) => {
              const series = grouped[cat];
              if (!series || series.length === 0) return null;

              return (
                <section key={cat}>
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                    <span className="h-2 w-2 rounded-full bg-accent" />
                    {cat}
                  </h3>
                  <div className="space-y-6">
                    {series.map((s) => (
                      <PriceTrendChart key={s.name} series={s} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* Footer note */}
        <div className="mt-12 border-t border-border pt-6">
          <div className="flex flex-col items-center gap-1 text-center text-xs text-muted-foreground">
            <p>数据来源：日报历史归档 · 自动同步更新</p>
            <p>仅供参考，不构成投资建议</p>
          </div>
        </div>
      </div>
    </div>
  );
}
