import fs from "fs";
import path from "path";

export interface ReportMeta {
  date: string; // YYYY-MM-DD
  title: string;
  weekday: string;
}

export interface ReportData {
  meta: ReportMeta;
  content: string; // raw markdown
}

const REPORTS_DIR = path.join(process.cwd(), "data/reports");

const WEEKDAY_NAMES = ["日", "一", "二", "三", "四", "五", "六"];

function parseDateFromFilename(filename: string): string | null {
  const match = filename.match(/energy_daily_(\d{4}-\d{2}-\d{2})\.md$/);
  return match ? match[1] : null;
}

function parseTitleDate(markdown: string): string | null {
  // Try to extract date from: "**2026年6月20日 星期五**"
  const match = markdown.match(/\*\*(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (match) {
    const [_, y, m, d] = match;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return null;
}

function getWeekday(dateStr: string): string {
  const d = new Date(dateStr);
  return WEEKDAY_NAMES[d.getDay()];
}

export function getAllReports(): ReportMeta[] {
  if (!fs.existsSync(REPORTS_DIR)) return [];

  const files = fs.readdirSync(REPORTS_DIR);
  const reports: ReportMeta[] = [];

  for (const file of files) {
    if (!file.endsWith(".md")) continue;

    const dateFromFilename = parseDateFromFilename(file);
    if (!dateFromFilename) continue;

    const filePath = path.join(REPORTS_DIR, file);
    const content = fs.readFileSync(filePath, "utf-8");
    const dateFromContent = parseTitleDate(content);
    const date = dateFromContent || dateFromFilename;

    reports.push({
      date,
      title: `一次能源·电力市场联合日报`,
      weekday: getWeekday(date),
    });
  }

  // Sort by date descending (newest first)
  reports.sort((a, b) => b.date.localeCompare(a.date));
  return reports;
}

export function getReportByDate(date: string): ReportData | null {
  // Try exact filename first
  let filePath = path.join(REPORTS_DIR, `energy_daily_${date}.md`);

  if (!fs.existsSync(filePath)) {
    // Try to find by content date
    const files = fs.readdirSync(REPORTS_DIR);
    for (const file of files) {
      if (!file.endsWith(".md")) continue;
      const content = fs.readFileSync(path.join(REPORTS_DIR, file), "utf-8");
      if (parseTitleDate(content) === date) {
        filePath = path.join(REPORTS_DIR, file);
        break;
      }
    }
  }

  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, "utf-8");
  const titleDate = parseTitleDate(content) || date;

  return {
    meta: {
      date: titleDate,
      title: "一次能源·电力市场联合日报",
      weekday: getWeekday(titleDate),
    },
    content,
  };
}

export function getLatestReport(): ReportData | null {
  const all = getAllReports();
  if (all.length === 0) return null;
  return getReportByDate(all[0].date);
}

export function getAdjacentDates(date: string): {
  prev: string | null;
  next: string | null;
} {
  const all = getAllReports();
  const dates = all.map((r) => r.date);
  const idx = dates.indexOf(date);

  return {
    prev: idx < dates.length - 1 ? dates[idx + 1] : null,
    next: idx > 0 ? dates[idx - 1] : null,
  };
}
