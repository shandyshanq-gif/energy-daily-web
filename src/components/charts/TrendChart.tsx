"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TrendDataPoint {
  date: string;
  value: number;
  label?: string;
}

interface TrendChartProps {
  data: TrendDataPoint[];
  title: string;
  color?: string;
  gradientColor?: string;
}

export default function TrendChart({
  data,
  title,
  color = "#3B82F6",
  gradientColor = "#93C5FD",
}: TrendChartProps) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      date: item.date.split("-").slice(1).join("/"), // MM/DD format
    }));
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">暂无数据</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12, fill: "#6B7280" }}
              axisLine={{ stroke: "#E5E7EB" }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: "#6B7280" }}
              axisLine={{ stroke: "#E5E7EB" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #E5E7EB",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              labelStyle={{ color: "#374151", fontWeight: "bold" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorGradient)"
              name="数值"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}