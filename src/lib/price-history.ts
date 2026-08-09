// 历史价格数据提取器 - 从所有日报 Markdown 中提取价格时间序列

import { getAllReports, getReportByDate } from "@/lib/reports";
import { extractSections, extractPriceTable } from "@/lib/markdown";

export interface PricePoint {
  date: string;        // YYYY-MM-DD
  value: number;       // 价格数值
  unit: string;        // 单位
  name: string;        // 品种名称（归一化后）
}

export interface PriceSeries {
  name: string;        // 如 "WTI"、"Brent"、"JKM"
  unit: string;        // 如 "美元/桶"、"元/吨"
  data: PricePoint[];  // 按日期排序
  category: string;    // "原油" | "天然气" | "煤炭" | "电力"
}

// ── 品种白名单（v8.1.0 可信渠道） ──
// 与日报 Markdown 实际品种名称对齐：
//   原油: WTI, Brent
//   天然气: JKM, TTF, Henry Hub（日报中写全称 "Henry Hub"，不是 "HH"）
//   煤炭: 5500, 5000, 山西坑口（日报中写 "CCTD综合交易5500(平仓价)" 等，需归一化）
const VALID_SPECIES: Record<string, string[]> = {
  "原油": ["WTI", "Brent"],
  "天然气": ["JKM", "TTF", "Henry Hub"],
  "煤炭": ["5500", "5000", "山西坑口"],
};

// ── 单位映射表（硬编码兜底，不从 Markdown 提取） ──
// 按品种名称（归一化后）映射到标准单位
const UNIT_MAP: Record<string, string> = {
  "WTI": "美元/桶",
  "Brent": "美元/桶",
  "JKM": "美元/百万英热",
  "TTF": "欧元/兆瓦时",
  "Henry Hub": "美元/百万英热",
  "HH": "美元/百万英热",        // 向后兼容：旧日报可能使用 HH 缩写
  "LNG": "元/吨",
  "5500": "元/吨",
  "5000": "元/吨",
  "山西坑口": "元/吨",
};

// ── 品种名称归一化 ──
// 将日报 Markdown 中的原始品种名称映射到白名单中的标准名称，
// 避免同一品种因写法不同而被拆分成多个时间序列。
function normalizeName(name: string): string {
  // 去除品类词重复，避免 "WTI原油" 和 "WTI" 分为两个品种
  let n = name.replace(/原油|天然气|煤炭|LNG/g, '').trim();

  // ── 天然气品种归一化 ──
  // 日报中 "Henry Hub" 和 "HH" 指同一品种，统一为 "Henry Hub"
  if (n.includes('Henry Hub') || n === 'HH' || n.includes('HH(')) {
    return 'Henry Hub';
  }

  // ── 煤炭品种归一化 ──
  // 日报实际写法：
  //   "CCTD综合交易5500(平仓价)" → "5500"
  //   "CCTD现货交易5000(平仓价)" → "5000"
  //   "山西5500(坑口价)"        → "山西坑口"
  //   "陕西/蒙西/蒙东5500(坑口价)" → 不在白名单，返回原名由 isValidSpecies 过滤
  //   "动力煤(Q5500)"             → 不在白名单（TradingEconomics 旧数据源），返回原名过滤
  // 顺序：坑口类优先拦截 → 5500/5000 只匹配CCTD平仓价品种
  if (n.includes('坑口')) {
    if (n.includes('山西')) return '山西坑口';
    return n; // 陕西/蒙西/蒙东等坑口品种，不在白名单，将被过滤
  }
  // 只匹配 CCTD 品种（平仓价），排除"动力煤(Q5500)"等非 CCTD 数据源
  if (n.includes('5500') && n.includes('CCTD')) {
    return '5500';
  }
  if (n.includes('5000') && n.includes('CCTD')) {
    return '5000';
  }

  // 如果去除后为空，返回原名
  return n || name;
}

// ── 品种有效性校验 ──
// 检查归一化后的品种名称是否在白名单中
function isValidSpecies(category: string, name: string): boolean {
  const allowed = VALID_SPECIES[category];
  if (!allowed) return false;
  // 精确匹配（归一化后的名称应与白名单条目一致）
  return allowed.includes(name);
}

// ── 单位推断 ──
// 根据归一化后的品种名称推断单位
function inferUnit(name: string): string {
  // 精确匹配优先
  if (UNIT_MAP[name]) return UNIT_MAP[name];
  // 模糊匹配兜底
  for (const [key, unit] of Object.entries(UNIT_MAP)) {
    if (name.includes(key)) return unit;
  }
  return "";
}

// 从表格单元格中提取价格数值
// 输入示例：
//   "**84.67**"             → 84.67
//   "**21.45** 美元/百万英热" → 21.45
//   "**725.0** 元/吨"        → 725.0
//   "5612"                   → 5612
//   "-> 0"                   → null（非价格列，返回 null）
//   "↑ 1.29%"               → 1.29（如果误入价格列，仍可提取数值）
function extractNumericPrice(cell: string): number | null {
  // 移除格式化字符：箭头、粗体标记、货币符号等
  const cleaned = cell
    .replace(/[↑↓▲▼*_$€]/g, '')
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
    if (category === "电力" || category === "其他") continue; // 电力板块通常没有标准化价格表格

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
        
        const normalized = normalizeName(name);
        // 跳过不在白名单中的品种
        if (!isValidSpecies(category, normalized)) continue;

        // 尝试第二列作为价格
        const priceVal = row[1] ? extractNumericPrice(row[1]) : null;
        if (priceVal !== null && priceVal > 0) {
          points.push({
            date,
            value: priceVal,
            unit: inferUnit(normalized),
            name: `${category}-${normalized}`,
          });
        }
      }
    } else {
      for (const row of rows) {
        const name = nameColIdx >= 0 ? row[nameColIdx]?.replace(/[🔥🛢️⛏️⚡]/g, '').trim() : "";
        if (!name) continue;
        
        const normalized = normalizeName(name);
        // 跳过不在白名单中的品种
        if (!isValidSpecies(category, normalized)) continue;

        const priceVal = priceColIdx >= 0 ? extractNumericPrice(row[priceColIdx]) : null;
        
        if (priceVal !== null && priceVal > 0) {
          points.push({
            date,
            value: priceVal,
            unit: inferUnit(normalized),
            name: `${category}-${normalized}`,
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
      const normalizedName = normalizeName(point.name.replace(/^.*?-/, ""));
      const key = `${point.name.split("-")[0]}-${normalizedName}`;
      
      if (!seriesMap[key]) {
        const category = point.name.split("-")[0];
        seriesMap[key] = {
          name: normalizedName,
          unit: point.unit || inferUnit(normalizedName),
          data: [],
          category,
        };
      }
      seriesMap[key].data.push(point);
    }
  }

  // 按日期排序并过滤无效值
  const result = Object.values(seriesMap)
    .map((series) => ({
      ...series,
      data: series.data
        .filter((p) => p.value > 0)
        .sort((a, b) => a.date.localeCompare(b.date)),
    }))
    .filter((series) => series.data.length >= 2); // 至少需要2个数据点才能画线

  // 合并同名品种（名称归一化后可能有多个 key 指向同一品种）
  const merged: Record<string, PriceSeries> = {};
  for (const series of result) {
    const key = `${series.category}-${series.name}`;
    if (!merged[key]) {
      merged[key] = { ...series, data: [...series.data] };
    } else {
      // 合并数据点并去重
      const existingDates = new Set(merged[key].data.map(p => p.date));
      for (const point of series.data) {
        if (!existingDates.has(point.date)) {
          merged[key].data.push(point);
          existingDates.add(point.date);
        }
      }
      merged[key].data.sort((a, b) => a.date.localeCompare(b.date));
    }
  }

  return Object.values(merged);
}
