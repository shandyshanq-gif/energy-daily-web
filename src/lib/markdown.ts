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
  publishTime?: string;
}

export interface MarketNewsItem {
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  publishTime?: string;
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
  // 使用更灵活的正则，支持带或不带emoji的情况
  const patterns = [
    /##\s+🌤️?\s*核心负荷区天气[\s\S]+(?=---|## )/,
    /##\s+天气[\s\S]+(?=---|## )/,
    /##\s+核心负荷区天气[\s\S]+(?=---|## )/,
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
    /### 🏟️ 政策[\s\S]*?(?=###|## |$)/
  );
  if (!policySection) return [];

  const policies: PolicyItem[] = [];
  // Match numbered list items with urgency labels: 1. 🔴 **Title** — Summary [time pattern] [来源](url)
  // 支持多种时间格式，并提取发布时间文本
  // 捕获组: [1]=title, [2]=summary, [3]=timeText, [4]=source, [5]=sourceUrl
  // IMPORTANT: Use \p{Emoji_Presentation} with u flag instead of [⚪🟡🔴] character class
  // because JavaScript regex engine has compatibility issues with surrogate-pair emoji in character classes
  const regex =
    /\d+\.\s+\p{Emoji_Presentation}\s+\*\*(.+?)\*\*\s*[—–-]+\s*(.*?)\s+(发布时间：\d{4}-\d{2}-\d{2}(?:\s+\d{2}:\d{2})?（[^）]+）|\d{4}-\d{2}-\d{2}(?:\s+\d{2}:\d{2})?|\d+(?:小时|天)前)\s*\[([^\]]+)\]\(([^)]+)\)/gu;
  let match;
  while ((match = regex.exec(policySection[0])) !== null) {
    policies.push({
      title: match[1].trim(),
      summary: match[2].trim() || "暂无摘要",
      source: match[4].trim(),
      sourceUrl: match[5].trim(),
      publishTime: match[3] ? match[3].trim() : undefined,
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
    /### 📰 市场动态[\s\S]*?(?=###|## |$)/
  );
  if (!newsSection) return [];

  const news: MarketNewsItem[] = [];
  // Match numbered list items with urgency labels: 1. 🔴 **Title** — Summary [time pattern] [来源](url)
  // 支持多种时间格式，并提取发布时间文本
  // 捕获组: [1]=title, [2]=summary, [3]=timeText, [4]=source, [5]=sourceUrl
  // IMPORTANT: Use \p{Emoji_Presentation} with u flag instead of [⚪🟡🔴] character class
  // because JavaScript regex engine has compatibility issues with surrogate-pair emoji in character classes
  const regex =
    /\d+\.\s+\p{Emoji_Presentation}\s+\*\*(.+?)\*\*\s*[—–-]+\s*(.*?)\s+(发布时间：\d{4}-\d{2}-\d{2}(?:\s+\d{2}:\d{2})?（[^）]+）|\d{4}-\d{2}-\d{2}(?:\s+\d{2}:\d{2})?|\d+(?:小时|天)前)\s*\[([^\]]+)\]\(([^)]+)\)/gu;
  let match;
  while ((match = regex.exec(newsSection[0])) !== null) {
    news.push({
      title: match[1].trim(),
      summary: match[2].trim() || "暂无摘要",
      source: match[4].trim(),
      sourceUrl: match[5].trim(),
      publishTime: match[3] ? match[3].trim() : undefined,
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
