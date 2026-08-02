// 数据看板 - 历史价格可视化

import { getAllPriceSeries, type PriceSeries } from "@/lib/price-history";
import PriceTrendChart from "@/components/charts/PriceTrendChart";

export const dynamic = "force-static";

export default function DashboardPage() {
  const allSeries = getAllPriceSeries();

  const categories = ["原油", "天然气", "煤炭"];
  const grouped = categories.reduce<Record<string, PriceSeries[]>>((acc, cat) => {
    acc[cat] = allSeries.filter((s) => s.category === cat);
    return acc;
  }, {});

  const totalDataPoints = allSeries.reduce((sum, s) => sum + s.data.length, 0);
  const totalSeries = allSeries.length;

  return (
    <div className="flex flex-col min-h-full">
      {/* Masthead */}
      <div className="masthead">
        <div>
          <div className="masthead-issue">Dashboard</div>
          <h1>历史价格数据看板</h1>
          <div className="masthead-meta">
            基于日报沉淀数据自动生成 · {totalSeries} 个价格序列 · {totalDataPoints} 个数据点
          </div>
        </div>
      </div>

      {/* 时间口径说明 */}
      <div className="content">
        <div className="c-12">
          <div className="card">
            <div className="card-body" style={{ padding: "12px 24px" }}>
              <p className="text-[11px]" style={{ color: "var(--ink-tertiary)" }}>
                📅 时间口径：所有图表横轴均按自然日（00:00–24:00）统计，日期来自能源日报发布日期。
                数据点 ≤ 1 年时显示 MM-DD，跨年时显示完整 YYYY-MM-DD。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 内容 */}
      <div className="content">
        {allSeries.length === 0 ? (
          <div className="c-12">
            <div className="card">
              <div className="card-body" style={{ textAlign: "center", padding: "64px 24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600 }}>暂无足够的历史数据</h3>
                <p className="text-[11px] mt-2" style={{ color: "var(--ink-tertiary)" }}>
                  需要至少 2 期日报才能生成价格趋势图
                </p>
              </div>
            </div>
          </div>
        ) : (
          categories.map((cat) => {
            const series = grouped[cat];
            if (!series || series.length === 0) return null;

            return (
              <div className="c-12" key={cat}>
                <div className="card">
                  <div className="card-head">
                    <span className="card-eyebrow">{cat}</span>
                    <span className="card-head-right">{series.length} 个价格序列</span>
                  </div>
                  <div className="card-body" style={{ padding: "24px" }}>
                    {/* 宽屏自适应图表网格: 1/2/3/4 栏，单图表最小宽度 ≥ 400px */}
                    <div className="dashboard-chart-grid">
                      {series.map((s) => (
                        <PriceTrendChart key={s.name} series={s} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}