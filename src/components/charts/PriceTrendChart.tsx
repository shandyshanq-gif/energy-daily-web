"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";
import { TrendingUp } from "lucide-react";
import type { PriceSeries } from "@/lib/price-history";

interface PriceTrendChartProps {
  series: PriceSeries;
}

// 品种颜色映射
const categoryColors: Record<string, string> = {
  "原油": "#1e3a5f",
  "天然气": "#f43f5e",
  "煤炭": "#d97706",
  "电力": "#7c3aed",
};

export default function PriceTrendChart({ series }: PriceTrendChartProps) {
  const color = categoryColors[series.category] || "#3b82f6";

  const { chartData, showYear } = useMemo(() => {
    // 计算数据跨度，决定 X 轴显示格式
    const sorted = [...series.data].sort((a, b) => a.date.localeCompare(b.date));
    const spanDays = sorted.length > 1
      ? (new Date(sorted[sorted.length - 1].date).getTime() - new Date(sorted[0].date).getTime()) / 86400000
      : 0;
    const showYear = spanDays > 365;

    const data = series.data.map((p) => ({
      date: showYear ? p.date : p.date.slice(5), // 跨年显示 YYYY-MM-DD，否则 MM-DD
      fullDate: p.date,
      price: p.value,
    }));
    return { chartData: data, showYear };
  }, [series.data]);

  // 计算统计信息
  const stats = useMemo(() => {
    if (chartData.length < 2) return null;
    const values = chartData.map((d) => d.price);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const first = values[0];
    const last = values[values.length - 1];
    const change = last - first;
    const changePercent = first !== 0 ? ((change / first) * 100).toFixed(1) : "0.0";
    return { min, max, first, last, change, changePercent };
  }, [chartData]);

  // Y轴域名：基于实际数据范围添加 10% padding，避免离群值拉宽轴范围
  const yAxisDomain = useMemo(() => {
    const values = chartData.map((d) => d.price);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = Math.max((max - min) * 0.1, min * 0.02);
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  }, [chartData]);

  if (chartData.length < 2) return null;

  const unitSuffix = series.unit ? ` ${series.unit}` : "";
  const xAxisLabel = showYear ? "日期 (YYYY-MM-DD)" : "日期 (MM-DD)";
  const yAxisLabel = series.unit || "数值";

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span
            className="h-2.5 w-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
          <h4 className="text-sm font-semibold text-foreground">{series.name}</h4>
          {series.unit && (
            <span className="text-xs text-muted-foreground">({series.unit})</span>
          )}
        </div>
        {stats && (
          <div className="flex items-center gap-3 text-xs">
            <span className="text-muted-foreground">
              最新: <strong className="text-foreground">{stats.last.toFixed(2)}{unitSuffix}</strong>
            </span>
            <span
              className={`font-medium ${
                stats.change > 0
                  ? "text-rose-600 dark:text-rose-400"
                  : stats.change < 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-400"
              }`}
            >
              <TrendingUp
                className={`inline-block h-3 w-3 mr-0.5 ${
                  stats.change < 0 ? "rotate-180" : ""
                }`}
              />
              {stats.change > 0 ? "+" : ""}
              {stats.changePercent}%
            </span>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="p-4">
        <div className="h-48 lg:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              >
                <Label
                  value={xAxisLabel}
                  position="bottom"
                  offset={10}
                  style={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                />
              </XAxis>
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
                width={65}
                domain={[yAxisDomain[0], yAxisDomain[1]]}
              >
                <Label
                  value={yAxisLabel}
                  position="insideTopRight"
                  offset={-5}
                  style={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                />
              </YAxis>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontSize: "13px",
                }}
                labelStyle={{ color: "var(--foreground)", fontWeight: 600, marginBottom: 4 }}
                formatter={((value: any) => [`${Number(value).toFixed(2)}${unitSuffix}`, series.name]) as any}
                labelFormatter={((label: any, payload: any[]) => {
                  const fullDate = payload[0]?.payload?.fullDate || label;
                  return `日期: ${fullDate}`;
                }) as any}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke={color}
                strokeWidth={2.5}
                dot={{ fill: color, r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, stroke: "var(--card)", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats summary */}
      {stats && (
        <div className="grid grid-cols-4 gap-px bg-border">
          {[
            { label: "起始", value: `${stats.first.toFixed(2)}${unitSuffix}` },
            { label: "最新", value: `${stats.last.toFixed(2)}${unitSuffix}` },
            { label: "最低", value: `${stats.min.toFixed(2)}${unitSuffix}` },
            { label: "最高", value: `${stats.max.toFixed(2)}${unitSuffix}` },
          ].map((item) => (
            <div key={item.label} className="bg-card px-3 py-2.5 text-center">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {item.label}
              </div>
              <div className="mt-0.5 text-xs font-semibold text-foreground">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
