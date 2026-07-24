// 历史价格数据提取器 — 从所有日报 Markdown 中提取价格时间序列

import { getAllReports, getReportByDate } from "@/lib/reports";
import { extractSections, extractPriceTable } from "@/lib/markdown";

export interface PricePoint {
  date: string;        // YYYY-MM-DD
  value: number;       // 价格数值
  unit: string;        // 单位
  name: string;        // 品种名称
}

export interface PriceSeries {
  name: string;        // 如 "WTI原油"、"Brent原油"、"JKM LNG"
  unit: string;        // 如 "美元/桶"、"元/吨"
  data: PricePoint[];  // 按日期排序
  category: string;    // "原油" | "天然气" | "煤炭" | "电力"
}

// 从表格行中提取价格数值
function extractNumericPrice(cell: string): number | null {
  // 移除格式化字符：箭头、粗体、货币符号等
  const cleaned = cell
    .replace(/[↑↓▲▼*_]/g, '')
    .replace(/,/g, '')
    .trim();
  
  // 尝试匹配数字（支持小数点）
  const match = cleaned.match(/(\d+\.?\d*)/);
  if (!match) return null;
  
  const value = parseFloat(match[1]);
  return isNaN(value) ? null : value;
}

// 确定品类
function detectCategory(heading: string): string {
  if (heading.includes("原油") || heading.includes("🛢️")) return "原油";
  if (heading.includes("天然气") || heading.includes("LNG") || heading.includes("🔥")) return "天然气";
  if (heading.includes("煤炭") || heading.includes("⛏️")) return "煤炭";
  if (heading.includes("电力") || heading.includes("⚡")) return "电力";
  return "其他";
}

// 从报告内容中提取价格数据
function extractPricesFromReport(
  date: string,
  content: string
): PricePoint[] {
  const points: PricePoint[] = [];
  const sections = extractSections(content);

  for (const section of sections) {
    const category = detectCategory(section.heading);
    if (category === "电力") continue; // 电力板块通常没有标准化价格表格

    // 提取表格
    const lines = section.content.split("\n");
    const tableLines = lines
      .map((l) => l.trim())
      .filter((l) => l.startsWith("|") && l.endsWith("|"));

    if (tableLines.length < 3) continue;

    const tableResult = extractPriceTable(tableLines.join("\n"));
    if (!tableResult) continue;

    const { headers, rows } = tableResult;

    // 找到"价格"列和"品种名称"列的索引
    const nameColIdx = headers.findIndex(
      (h) => h.includes("品种") || h.includes("名称") || h.includes("品名") || h.includes("指标")
    );
    const priceColIdx = headers.findIndex(
      (h) => h.includes("价格") || h.includes("最新价") || h.includes("收盘") || h.includes("均价")
    );

    if (nameColIdx === -1 && priceColIdx === -1) {
      // 备选：如果表格第一列是名称，找包含数字的列作为价格
      for (const row of rows) {
        const name = row[0]?.replace(/[🔥🛢️⛏️⚡]/g, '').trim();
        if (!name) continue;
        
        // 尝试第二列作为价格
        const priceVal = row[1] ? extractNumericPrice(row[1]) : null;
        if (priceVal !== null) {
          points.push({
            date,
            value: priceVal,
            unit: "",
            name: `${category}-${name}`,
          });
        }
      }
    } else {
      for (const row of rows) {
        const name = nameColIdx >= 0 ? row[nameColIdx]?.replace(/[🔥🛢️⛏️⚡]/g, '').trim() : "";
        const priceVal = priceColIdx >= 0 ? extractNumericPrice(row[priceColIdx]) : null;
        
        if (name && priceVal !== null) {
          points.push({
            date,
            value: priceVal,
            unit: "",
            name: `${category}-${name}`,
          });
        }
      }
    }
  }

  return points;
}

// 获取所有历史价格数据
export function getAllPriceSeries(): PriceSeries[] {
  const allReports = getAllReports();
  const seriesMap: Record<string, PriceSeries> = {};

  for (const reportMeta of allReports) {
    const report = getReportByDate(reportMeta.date);
    if (!report) continue;

    const points = extractPricesFromReport(reportMeta.date, report.content);

    for (const point of points) {
      if (!seriesMap[point.name]) {
        const category = point.name.split("-")[0];
        seriesMap[point.name] = {
          name: point.name.replace(/^.*?-/, ""),
          unit: point.unit,
          data: [],
          category,
        };
      }
      seriesMap[point.name].data.push(point);
    }
  }

  // 按日期排序并过滤无效值
  return Object.values(seriesMap)
    .map((series) => ({
      ...series,
      data: series.data
        .filter((p) => p.value > 0)
        .sort((a, b) => a.date.localeCompare(b.date)),
    }))
    .filter((series) => series.data.length >= 2); // 至少需要2个数据点才能画线
}
