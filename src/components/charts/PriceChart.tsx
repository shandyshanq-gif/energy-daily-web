"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface PriceDataPoint {
  date: string;
  price: number;
  change?: number;
}

interface PriceChartProps {
  data: PriceDataPoint[];
  title: string;
  color?: string;
  showChange?: boolean;
}

export default function PriceChart({
  data,
  title,
  color = "#3B82F6",
  showChange = false,
}: PriceChartProps) {
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
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
            <Legend />
            <Line
              type="monotone"
              dataKey="price"
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
              name="价格"
            />
            {showChange && (
              <Line
                type="monotone"
                dataKey="change"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: "#10B981", strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                name="涨跌"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}