import fs from "fs";
import path from "path";

export interface PriceData {
  category: string;
  items: {
    name: string;
    price: string;
    dailyChange: string;
    monthlyChange: string;
    yoyChange?: string;
    date: string;
    source?: string;
    sourceUrl?: string;
  }[];
}

export interface PolicyItem {
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
}

export interface MarketNewsItem {
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
}

export interface WeatherData {
  city: string;
  weather: string;
  tempLow: number;
  tempHigh: number;
  wind: string;
}

/**
 * Check if a file exists and read its content
 */
export function readReportFile(date: string): string | null {
  const filePath = path.join(
    process.cwd(),
    "data/reports",
    `energy_daily_${date}.md`
  );
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf-8");
}

/**
 * Extract the first H1 title from markdown
 */
export function extractTitle(markdown: string): string {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "能源日报";
}

/**
 * Extract subtitle/quote from markdown
 */
export function extractSubtitle(markdown: string): string {
  const match = markdown.match(/^>\s+\*\*(.+?)\*\*/m);
  return match ? match[1].trim() : "";
}

/**
 * Extract the date info line from the markdown
 */
export function extractDateLine(markdown: string): string {
  const match = markdown.match(/^>\s+\*\*(.+?)\*\*/m);
  if (match) {
    const line = match[1].trim();
    const dateMatch = line.match(/(\d{4}年\d{1,2}月\d{1,2}日\s*星期.)/);
    return dateMatch ? dateMatch[1] : line;
  }
  return "";
}

/**
 * Extract sections from markdown with their headings
 */
export function extractSections(
  markdown: string
): { heading: string; content: string }[] {
  const sections: { heading: string; content: string }[] = [];
  const lines = markdown.split("\n");
  let currentHeading = "";
  let currentContent: string[] = [];

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (currentHeading) {
        sections.push({
          heading: currentHeading,
          content: currentContent.join("\n").trim(),
        });
      }
      currentHeading = line.replace("## ", "").trim();
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }

  if (currentHeading) {
    sections.push({
      heading: currentHeading,
      content: currentContent.join("\n").trim(),
    });
  }

  return sections;
}

/**
 * Extract price table data from markdown table content
 */
export function extractPriceTable(
  tableContent: string
): { headers: string[]; rows: string[][] } | null {
  const lines = tableContent
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && l.startsWith("|") && l.endsWith("|"));

  if (lines.length < 3) return null; // need header + separator + at least 1 row

  const headerLine = lines[0];
  const headers = headerLine
    .split("|")
    .filter((h) => h.trim().length > 0)
    .map((h) => h.trim());

  // Skip separator line (index 1)
  const rows: string[][] = [];
  for (let i = 2; i < lines.length; i++) {
    const cells = lines[i]
      .split("|")
      .filter((c) => c.trim().length > 0)
      .map((c) => c.trim());
    if (cells.length > 0) {
      rows.push(cells);
    }
  }

  return { headers, rows };
}

/**
 * Extract weather data from markdown table
 */
export function extractWeatherData(markdown: string): WeatherData[] {
  // 尝试多种格式匹配天气板块
  const patterns = [
    /## 🌤️ 核心负荷区天气[\s\S]*?(?=---|## )/,
    /## 天气[\s\S]*?(?=---|## )/,
    /## 核心负荷区天气[\s\S]*?(?=---|## )/,
  ];

  let weatherSection: RegExpMatchArray | null = null;
  for (const pattern of patterns) {
    weatherSection = markdown.match(pattern);
    if (weatherSection) break;
  }

  if (!weatherSection) return [];

  const lines = weatherSection[0]
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("|") && l.endsWith("|"));

  if (lines.length < 3) return []; // header + separator + data rows

  const weatherData: WeatherData[] = [];
  for (let i = 2; i < lines.length; i++) {
    const cells = lines[i]
      .split("|")
      .filter((c) => c.trim().length > 0)
      .map((c) => c.trim());
    if (cells.length >= 4) {
      // 处理温度格式：支持 🔥 **28~37** 或 23~28 或 N/A
      const tempStr = cells[2].replace(/[🔥⚡📊✅😴]/g, '').replace(/\*\*/g, '').trim();
      const tempMatch = tempStr.match(/(\d+)~(\d+)/);
      const cityClean = cells[0].replace(/[🌴🌊🏙️🌾❄️]/g, '').trim();
      weatherData.push({
        city: cityClean,
        weather: cells[1],
        tempLow: tempMatch ? parseInt(tempMatch[1]) : 0,
        tempHigh: tempMatch ? parseInt(tempMatch[2]) : 0,
        wind: cells[3],
      });
    }
  }

  return weatherData;
}

/**
 * Extract policy items from markdown
 */
export function extractPolicies(
  markdown: string
): PolicyItem[] {
  const policySection = markdown.match(
    /### 🏛️ 政策[\s\S]*?(?=###|## |$)/
  );
  if (!policySection) return [];

  const policies: PolicyItem[] = [];
  // Match numbered list items: 1. **Title** — Summary.[来源](url)
  const regex =
    /\d+\.\s+\*\*(.+?)\*\*\s*[—–-]+\s*(.+?)\s*\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = regex.exec(policySection[0])) !== null) {
    policies.push({
      title: match[1].trim(),
      summary: match[2].trim(),
      source: match[3].trim(),
      sourceUrl: match[4].trim(),
    });
  }

  return policies;
}

/**
 * Extract market news items from markdown
 */
export function extractMarketNews(
  markdown: string
): MarketNewsItem[] {
  const newsSection = markdown.match(
    /### 📰 市场[\s\S]*?(?=###|## |$)/
  );
  if (!newsSection) return [];

  const news: MarketNewsItem[] = [];
  const regex =
    /\d+\.\s+\*\*(.+?)\*\*\s*[—–-]+\s*(.+?)\s*\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = regex.exec(newsSection[0])) !== null) {
    news.push({
      title: match[1].trim(),
      summary: match[2].trim(),
      source: match[3].trim(),
      sourceUrl: match[4].trim(),
    });
  }

  return news;
}

/**
 * Extract price change direction indicators from markdown
 */
export function extractChangeDirection(change: string): "up" | "down" | "flat" {
  if (change.includes("↑")) return "up";
  if (change.includes("↓")) return "down";
  return "flat";
}
