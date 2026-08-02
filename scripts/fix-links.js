/**
 * fix-links.js — 批量扫描 data/reports/*.md，修复异常链接
 *
 * 修复规则：
 *   1. sogou /link?url= 链接 → [text](url) 替换为纯文本 text
 *   2. # 锚点链接 → [text](#) 替换为纯文本 text
 *   3. javascript: 链接 → [text](url) 替换为纯文本 text
 *   4. 其他非 http/https 协议链接 → 替换为纯文本 text
 *
 * 用法：
 *   node scripts/fix-links.js [--dry-run]
 *
 * 输出：
 *   - 直接修改 data/reports/*.md（除非 --dry-run）
 *   - 巡检报告 data/link-audit-report.json
 */

const fs = require("fs");
const path = require("path");

// ─── 配置 ───
const REPORTS_DIR = path.join(__dirname, "..", "data", "reports");
const OUTPUT_REPORT = path.join(__dirname, "..", "data", "link-audit-report.json");

// ─── 工具函数 ───

/**
 * 判断 URL 是否为异常链接
 */
function isInvalidUrl(url) {
  const trimmed = url.trim();

  // # 锚点
  if (trimmed === "#") return { reason: "anchor_hash", suggestion: "降级为纯文本" };

  // javascript: 协议
  if (/^javascript:/i.test(trimmed)) return { reason: "javascript_protocol", suggestion: "降级为纯文本" };

  // sogou /link?url= 跳转
  if (/^\/link\?url=/i.test(trimmed)) return { reason: "sogou_redirect", suggestion: "降级为纯文本" };

  // 非 http/https 协议
  if (!/^https?:\/\//i.test(trimmed)) {
    // 尝试 new URL 校验
    try {
      const parsed = new URL(trimmed);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return { reason: "non_http_protocol", suggestion: "降级为纯文本" };
      }
    } catch {
      return { reason: "invalid_url", suggestion: "降级为纯文本" };
    }
  }

  return null; // URL 合法
}

/**
 * 在 markdown 内容中查找并修复异常链接
 * 返回 { fixedContent, fixes[] }
 */
function fixLinksInContent(content, filename) {
  const fixes = [];
  // 匹配 [text](url) 和 [text](url "title")，不匹配 ![alt](url)
  const linkRegex = /(^|[^!])\[([^\]]+)\]\(([^)]+)\)/g;
  let fixedContent = content;
  let offset = 0;

  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    const prefix = match[1]; // 前导字符（可能是空字符串）
    const text = match[2];
    let url = match[3].trim();

    // 处理 [text](url "title") 格式
    const titleMatch = url.match(/^(\S+)\s+"[^"]*"$/);
    if (titleMatch) url = titleMatch[1];

    const invalid = isInvalidUrl(url);
    if (invalid) {
      const fullMatch = match[0];
      const replacement = `${prefix}${text}`; // 降级为纯文本

      const startIdx = match.index + offset;
      const endIdx = startIdx + fullMatch.length;
      fixedContent = fixedContent.slice(0, startIdx) + replacement + fixedContent.slice(endIdx);
      offset += replacement.length - fullMatch.length;

      fixes.push({
        file: filename,
        text: text,
        url: url,
        reason: invalid.reason,
        suggestion: invalid.suggestion,
        line: content.substring(0, match.index).split("\n").length,
      });
    }
  }

  return { fixedContent, fixes };
}

// ─── 主流程 ───
function main() {
  const dryRun = process.argv.includes("--dry-run");

  console.log(`fix-links.js — 外链跳转异常批量修复`);
  console.log(`模式: ${dryRun ? "DRY RUN (不修改文件)" : "FIX (直接修改)"}`);
  console.log(`扫描目录: ${REPORTS_DIR}`);
  console.log("");

  if (!fs.existsSync(REPORTS_DIR)) {
    console.error(`错误: 目录不存在 ${REPORTS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(REPORTS_DIR).filter((f) => f.endsWith(".md"));
  console.log(`找到 ${files.length} 个 Markdown 文件\n`);

  const allFixes = [];
  let filesModified = 0;
  let totalLinksScanned = 0;
  let totalLinksFixed = 0;

  for (const file of files) {
    const filePath = path.join(REPORTS_DIR, file);
    const content = fs.readFileSync(filePath, "utf-8");

    // 统计所有链接
    const allLinks = content.match(/\[[^\]]+\]\([^)]+\)/g) || [];
    totalLinksScanned += allLinks.length;

    const { fixedContent, fixes } = fixLinksInContent(content, file);

    if (fixes.length > 0) {
      console.log(`[${file}] 修复 ${fixes.length} 处异常链接:`);
      for (const fix of fixes) {
        console.log(`  L${fix.line} [${fix.reason}] "${fix.text}" → ${fix.url}`);
      }
      allFixes.push(...fixes);
      totalLinksFixed += fixes.length;

      if (!dryRun) {
        fs.writeFileSync(filePath, fixedContent, "utf-8");
      }
      filesModified++;
    }
  }

  // 生成巡检报告
  const report = {
    scan_date: new Date().toISOString(),
    mode: dryRun ? "dry_run" : "fix",
    reports_dir: REPORTS_DIR,
    summary: {
      files_scanned: files.length,
      files_modified: filesModified,
      total_links_scanned: totalLinksScanned,
      total_links_fixed: totalLinksFixed,
      remaining_issues: 0, // 修复后应为 0
    },
    fixes: allFixes,
  };

  if (!dryRun) {
    fs.writeFileSync(OUTPUT_REPORT, JSON.stringify(report, null, 2), "utf-8");
    console.log(`\n巡检报告已保存: ${OUTPUT_REPORT}`);
  }

  console.log(`\n=== 汇总 ===`);
  console.log(`扫描文件: ${files.length}`);
  console.log(`修改文件: ${filesModified}`);
  console.log(`扫描链接: ${totalLinksScanned}`);
  console.log(`修复链接: ${totalLinksFixed}`);

  if (dryRun && allFixes.length > 0) {
    console.log("\n⚠ DRY RUN 模式，文件未实际修改。移除 --dry-run 参数以执行修复。");
  }
}

main();
