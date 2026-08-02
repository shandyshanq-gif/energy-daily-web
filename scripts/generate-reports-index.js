#!/usr/bin/env node
/**
 * generate-reports-index.js
 *
 * 构建时脚本：扫描 data/reports/*.md 文件，提取 date/weekday/title，
 * 输出到 public/data/reports-index.json，供静态导出后的客户端 fetch 使用。
 *
 * 用法：
 *   node scripts/generate-reports-index.js
 *
 * 建议在 next build 之前运行：
 *   "prebuild": "node scripts/generate-reports-index.js",
 *
 * 或直接在 build 脚本中串联：
 *   "build": "node scripts/generate-reports-index.js && next build"
 */

const fs = require("fs");
const path = require("path");

// ── 路径常量 ──────────────────────────────────────────────
const PROJECT_ROOT = path.resolve(__dirname, "..");
const REPORTS_DIR = path.join(PROJECT_ROOT, "data", "reports");
const OUTPUT_DIR = path.join(PROJECT_ROOT, "public", "data");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "reports-index.json");

// ── 工具函数（与 lib/reports.ts 保持一致） ──────────────────
const WEEKDAY_NAMES = ["日", "一", "二", "三", "四", "五", "六"];

/**
 * 从文件名提取日期：energy_daily_2026-08-02.md -> "2026-08-02"
 */
function parseDateFromFilename(filename) {
  const match = filename.match(/energy_daily_(\d{4}-\d{2}-\d{2})\.md$/);
  return match ? match[1] : null;
}

/**
 * 从 markdown 内容提取日期：**2026年8月2日 星期日** -> "2026-08-02"
 */
function parseTitleDate(markdown) {
  const match = markdown.match(/\*\*(\d{4})年(\d{1,2})月(\d{1,2})日/);
  if (match) {
    const [, y, m, d] = match;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return null;
}

/**
 * 从日期字符串获取中文星期
 */
function getWeekday(dateStr) {
  const d = new Date(dateStr + "T00:00:00"); // 避免时区偏移
  return WEEKDAY_NAMES[d.getDay()];
}

/**
 * 从 markdown 提取 H1 标题（去除 emoji）
 */
function extractTitle(markdown) {
  const match = markdown.match(/^#\s+(.+)$/m);
  if (match) {
    // 去除 emoji 和多余空白
    return match[1]
      .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}]/gu, "")
      .trim();
  }
  return "一次能源·电力市场联合日报";
}

// ── 主逻辑 ────────────────────────────────────────────────
function main() {
  console.log("[generate-reports-index] 开始生成 reports-index.json ...");

  // 检查 reports 目录是否存在
  if (!fs.existsSync(REPORTS_DIR)) {
    console.error(`[generate-reports-index] 错误: 目录不存在: ${REPORTS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(REPORTS_DIR);
  const reports = [];

  for (const file of files) {
    if (!file.endsWith(".md")) continue;

    const dateFromFilename = parseDateFromFilename(file);
    if (!dateFromFilename) {
      console.warn(`[generate-reports-index] 跳过不匹配的文件: ${file}`);
      continue;
    }

    const filePath = path.join(REPORTS_DIR, file);
    const content = fs.readFileSync(filePath, "utf-8");

    // 优先使用内容中的日期，回退到文件名中的日期
    const dateFromContent = parseTitleDate(content);
    const date = dateFromContent || dateFromFilename;

    const stat = fs.statSync(filePath);

    reports.push({
      date,
      title: extractTitle(content),
      weekday: getWeekday(date),
      createdAt: stat.birthtime.toISOString(),
      updatedAt: stat.mtime.toISOString(),
    });
  }

  // 按日期降序排列（最新在前）
  reports.sort((a, b) => b.date.localeCompare(a.date));

  // 确保输出目录存在
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 写入 JSON（UTF-8，2 空格缩进）
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(reports, null, 2), "utf-8");

  console.log(
    `[generate-reports-index] 完成: ${reports.length} 篇日报 -> ${path.relative(PROJECT_ROOT, OUTPUT_FILE)}`
  );

  // 输出前几条作为预览
  const preview = reports.slice(0, 3).map((r) => `  ${r.date} 星期${r.weekday} ${r.title}`);
  if (preview.length > 0) {
    console.log("[generate-reports-index] 预览:");
    preview.forEach((p) => console.log(p));
    if (reports.length > 3) {
      console.log(`  ... 还有 ${reports.length - 3} 篇`);
    }
  }
}

main();
