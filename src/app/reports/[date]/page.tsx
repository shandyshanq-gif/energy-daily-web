import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  Droplets,
  Flame,
  Zap,
  Mountain,
  BarChart3,
  Newspaper,
  CloudSun,
  Link2,
  Calendar,
  Archive,
} from "lucide-react";
import {
  getAllReports,
  getReportByDate,
  getAdjacentDates,
} from "@/lib/reports";
import {
  extractSections,
  extractPriceTable,
  extractWeatherData,
  extractPolicies,
  extractMarketNews,
  extractDateLine,
  type WeatherData,
  type PolicyItem,
  type MarketNewsItem,
} from "@/lib/markdown";
import PriceTable from "@/components/report/PriceTable";
import WeatherGrid from "@/components/report/WeatherGrid";
import PolicySection from "@/components/report/PolicySection";
import ReportNav from "@/components/report/ReportNav";
import ReportHeader from "@/components/report/ReportHeader";

// ─── Static generation ────────────────────────────────────────────────
export async function generateStaticParams() {
  try {
    const reports = getAllReports();
    return reports.map((r) => ({ date: r.date }));
  } catch {
    return [];
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────

function formatDate(date: string): string {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}年${m}月${day}日`;
}

/** Extract all markdown tables from a content string */
function extractTables(markdown: string): string[] {
  const tables: string[] = [];
  const lines = markdown.split("\n");
  let inTable = false;
  let currentTable: string[] = [];

  for (const line of lines) {
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      inTable = true;
      currentTable.push(line);
    } else {
      if (inTable && currentTable.length > 0) {
        tables.push(currentTable.join("\n"));
        currentTable = [];
      }
      inTable = false;
    }
  }
  if (currentTable.length > 0) {
    tables.push(currentTable.join("\n"));
  }
  return tables;
}

/** Extract blockquote text from content (commentary lines) */
function extractCommentary(markdown: string): string[] {
  const quotes: string[] = [];
  const lines = markdown.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("> ")) {
      quotes.push(trimmed.replace(/^>\s*/, "").trim());
    }
  }
  return quotes;
}

/** Extract lines that are NOT tables, blockquotes, or blank */
function extractTextLines(markdown: string): string[] {
  return markdown
    .split("\n")
    .map((l) => l.trim())
    .filter(
      (l) =>
        l.length > 0 &&
        !l.startsWith("|") &&
        !l.endsWith("|") &&
        !l.startsWith(">") &&
        !l.startsWith("---") &&
        !l.startsWith("*") &&
        !l.startsWith("#")
    );
}

/** Get icon and label for a section heading */
function getSectionMeta(
  heading: string
): {
  icon: React.ReactNode;
  label: string;
  type: "price" | "weather" | "policies" | "cross" | "summary" | "text";
} {
  if (heading.includes("🛢️") || heading.includes("原油")) {
    return { icon: <Droplets className="h-5 w-5" />, label: "原油", type: "price" };
  }
  if (heading.includes("🔥") || heading.includes("天然气") || heading.includes("LNG")) {
    return { icon: <Flame className="h-5 w-5" />, label: "天然气 / LNG", type: "price" };
  }
  if (heading.includes("⛏️") || heading.includes("煤炭")) {
    return { icon: <Mountain className="h-5 w-5" />, label: "煤炭", type: "price" };
  }
  if (heading.includes("⚡") || heading.includes("电力市场")) {
    return { icon: <Zap className="h-5 w-5" />, label: "电力市场", type: "policies" };
  }
  if (heading.includes("🌤️") || heading.includes("天气") || heading.includes("负荷区")) {
    return { icon: <CloudSun className="h-5 w-5" />, label: "核心负荷区天气", type: "weather" };
  }
  if (heading.includes("📊") || heading.includes("综合分析") || heading.includes("关键数据")) {
    return { icon: <BarChart3 className="h-5 w-5" />, label: "综合分析", type: "cross" };
  }
  if (heading.includes("🔗") || heading.includes("联动")) {
    return { icon: <Link2 className="h-5 w-5" />, label: "综合分析", type: "cross" };
  }
  return { icon: <Newspaper className="h-5 w-5" />, label: heading, type: "text" };
}

// ─── Commentary Block ─────────────────────────────────────────────────

function CommentaryBlock({ quotes }: { quotes: string[] }) {
  if (quotes.length === 0) return null;
  return (
    <div className="mt-3 space-y-2">
      {quotes.map((quote, i) => (
        <blockquote
          key={i}
          className="border-l-3 border-accent pl-4 text-sm text-muted-foreground italic leading-relaxed"
        >
          {quote}
        </blockquote>
      ))}
    </div>
  );
}

// ─── Section Renderer ─────────────────────────────────────────────────

function SectionRenderer({
  heading,
  content,
}: {
  heading: string;
  content: string;
}) {
  const meta = getSectionMeta(heading);
  const tables = extractTables(content);
  const commentary = extractCommentary(content);
  const textLines = extractTextLines(content);

  // Price sections (原油, 天然气, 煤炭)
  if (meta.type === "price") {
    const priceTables = tables
      .map((t) => extractPriceTable(t))
      .filter((p): p is { headers: string[]; rows: string[][] } => p !== null);

    return (
      <div className="space-y-4">
        {priceTables.length > 0 ? (
          priceTables.map((table, idx) => (
            <PriceTable
              key={idx}
              title={priceTables.length > 1 ? `${meta.label}（表 ${idx + 1}）` : meta.label}
              headers={table.headers}
              rows={table.rows}
              icon={meta.icon}
            />
          ))
        ) : (
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              {meta.icon}
              <h3 className="text-sm font-semibold">{meta.label}</h3>
            </div>
            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
              {content}
            </div>
          </div>
        )}
        {textLines.length > 0 && (
          <div className="space-y-1">
            {textLines.map((line, i) => (
              <p key={i} className="text-sm text-muted-foreground">
                {line}
              </p>
            ))}
          </div>
        )}
        <CommentaryBlock quotes={commentary} />
      </div>
    );
  }

  // Weather section
  if (meta.type === "weather") {
    const weatherData = extractWeatherData(`## ${heading}\n${content}`);
    return (
      <div>
        <WeatherGrid weatherData={weatherData} />
        <CommentaryBlock quotes={commentary} />
      </div>
    );
  }

  // Policies & News section (电力市场)
  if (meta.type === "policies") {
    const policies = extractPolicies(content);
    const news = extractMarketNews(content);
    const priceTables = tables
      .map((t) => extractPriceTable(t))
      .filter((p): p is { headers: string[]; rows: string[][] } => p !== null);

    return (
      <div className="space-y-4">
        {priceTables.length > 0 && (
          <div className="space-y-3">
            {priceTables.map((table, idx) => (
              <PriceTable
                key={idx}
                title=""
                headers={table.headers}
                rows={table.rows}
                icon={meta.icon}
              />
            ))}
          </div>
        )}
        <PolicySection policies={policies} news={news} />
        <CommentaryBlock quotes={commentary} />
      </div>
    );
  }

  // Summary & Cross sections (综合分析)
  if (meta.type === "summary" || meta.type === "cross") {
    const priceTables = tables
      .map((t) => extractPriceTable(t))
      .filter((p): p is { headers: string[]; rows: string[][] } => p !== null);

    // Extract numbered list items
    const numberedItems = content
      .split("\n")
      .filter((l) => l.trim().match(/^\d+\./))
      .map((l) => l.replace(/^\d+\.\s+/, "").replace(/\*\*/g, "").trim())
      .filter(Boolean);

    return (
      <div className="space-y-4">
        {priceTables.length > 0 ? (
          priceTables.map((table, idx) => (
            <PriceTable
              key={idx}
              title={meta.label}
              headers={table.headers}
              rows={table.rows}
              icon={meta.icon}
            />
          ))
        ) : numberedItems.length > 0 ? (
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              {meta.icon}
              <h3 className="text-sm font-semibold">{meta.label}</h3>
            </div>
            <ul className="space-y-3">
              {numberedItems.map((item, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-medium text-accent">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-2">
              {meta.icon}
              <h3 className="text-sm font-semibold">{meta.label}</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {content}
            </p>
          </div>
        )}
        <CommentaryBlock quotes={commentary} />
      </div>
    );
  }

  // Default text section - fallback
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-2">
        {meta.icon}
        <h3 className="text-sm font-semibold">{meta.label}</h3>
      </div>
      <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
        {content}
      </div>
      <CommentaryBlock quotes={commentary} />
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────────────────

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const report = getReportByDate(date);

  if (!report) {
    notFound();
  }

  const adjacent = getAdjacentDates(date);
  const sections = extractSections(report.content);
  const dateLine = extractDateLine(report.content);

  // Filter out empty sections (the intro block before first ##)
  const mainSections = sections.filter(
    (s) => s.content.trim().length > 0 || s.heading.trim().length > 0
  );

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Sticky top navigation bar ── */}
      <div className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">返回首页</span>
            </Link>
            <div className="h-4 w-px bg-border" />
            <Link href="/reports" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Archive className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">历史归档</span>
            </Link>
            <div className="h-4 w-px bg-border" />
            <span className="text-sm font-medium text-foreground">日报详情</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(date)} 星期{report.meta.weekday}</span>
          </div>
        </div>
      </div>

      {/* ── Scrollable content area ── */}
      <div className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 py-8">
        <ReportHeader date={date} weekday={report.meta.weekday} />

        <div className="space-y-10">
          {mainSections.map((section, idx) => (
            <section key={idx}>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                {getSectionMeta(section.heading).icon}
                <span>{getSectionMeta(section.heading).label}</span>
              </h2>
              <SectionRenderer
                heading={section.heading}
                content={section.content}
              />
            </section>
          ))}
        </div>

        <div className="mt-12">
          <ReportNav
            prevDate={adjacent.prev}
            nextDate={adjacent.next}
            currentDate={date}
          />
        </div>

        <div className="mt-8 border-t border-border pt-6 pb-4">
          <div className="flex flex-col items-center gap-1 text-center text-xs text-muted-foreground">
            <p>一次能源·电力市场联合日报 · {formatDate(date)}</p>
            <p>数据来源：公开市场数据 · 仅供参考，不构成任何业务建议或交易策略</p>
          </div>
        </div>
      </div>
    </div>
  );
}
