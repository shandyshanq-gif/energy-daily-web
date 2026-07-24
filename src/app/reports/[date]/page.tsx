import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Archive } from "lucide-react";
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
} from "@/lib/markdown";
import ReportNav from "@/components/report/ReportNav";

export async function generateStaticParams() {
  try {
    const reports = getAllReports();
    return reports.map((r) => ({ date: r.date }));
  } catch {
    return [];
  }
}

function formatDate(date: string): string {
  const d = new Date(date);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

/** 从 markdown cell 提取链接 [text](url) */
function extractLink(cell: string): { text: string; url: string } | null {
  const m = cell.match(/\[([^\]]+)\]\(([^)]+)\)/);
  return m ? { text: m[1], url: m[2] } : null;
}

/** 清理 markdown 粗体/emoji */
function cleanCell(s: string): string {
  return s.replace(/\*\*/g, "").replace(/[🛢️🔥⛏️⚡🌤️📊🔗🌴🌊🏙️🌾❄️🔥⚡📊✅😴]/gu, "").trim();
}

/** 从涨跌文本判断方向 */
function getChangeDir(val: string): "up" | "down" | "flat" {
  if (val.includes("↑")) return "up";
  if (val.includes("↓")) return "down";
  return "flat";
}

/** 从价格 cell 提取数字和单位 */
function parsePriceCell(cell: string): { value: string; unit: string } {
  const cleaned = cleanCell(cell);
  const m = cleaned.match(/^([\d.]+)\s*(.*)$/);
  if (m) return { value: m[1], unit: m[2] };
  return { value: cleaned, unit: "" };
}

// ─── 渲染：原油 / 天然气国际（大数字卡片） ───
function PriceCardSection({
  title,
  eyebrowRight,
  tables,
  columnsCount = 2,
}: {
  title: string;
  eyebrowRight: string;
  tables: { headers: string[]; rows: string[][] }[];
  columnsCount?: number;
}) {
  const cls = columnsCount === 3 ? "price-cards-3" : "price-cards";
  return (
    <div className="card">
      <div className="card-head">
        <span className="card-eyebrow">{title}</span>
        <span className="card-head-right">{eyebrowRight}</span>
      </div>
      <div className={cls}>
        {tables.flatMap((t, ti) =>
          t.rows.map((row, ri) => {
            const name = cleanCell(row[0]);
            const priceCell = row[1] || "";
            const { value, unit } = parsePriceCell(priceCell);
            const changeRaw = cleanCell(row[2] || "");
            const dir = getChangeDir(changeRaw);
            const changeText = changeRaw.replace(/[-+]/, (m) => (m === "-" ? "-" : "+"));
            const link = extractLink(row[row.length - 1] || "");

            // 找月涨跌/同比（如果有）
            let monthly = "";
            let yoy = "";
            if (t.headers.length > 4) {
              for (let h = 3; h < t.headers.length - 2; h++) {
                const hdr = t.headers[h].toLowerCase();
                if (hdr.includes("月")) monthly = cleanCell(row[h] || "");
                if (hdr.includes("同")) yoy = cleanCell(row[h] || "");
              }
            }

            return (
              <div className="price-card" key={`${ti}-${ri}`}>
                <div className="price-label">{name}</div>
                <div className="price-main">
                  <span className="price-value">{value || "数据暂缺"}</span>
                  {unit && <span className="price-unit">{unit}</span>}
                </div>
                {value ? (
                  <span className={`price-change ${dir}`}>{changeText || "→ 持平"}</span>
                ) : (
                  <span className="price-change none">— —</span>
                )}
                <div className="price-meta">
                  {monthly && <span>月涨跌 <strong>{monthly}</strong></span>}
                  {yoy && <span>同比 <strong>{yoy}</strong></span>}
                  {link && (
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="source-btn">
                      {link.text} ↗
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── 渲染：LNG 国内（全国均价大数 + 区域网格） ───
function LngDomesticSection({
  tables,
}: {
  tables: { headers: string[]; rows: string[][] }[];
}) {
  const table = tables[0];
  if (!table) return null;

  // 第一行是全国均价
  const nationalRow = table.rows[0];
  const nationalName = cleanCell(nationalRow[0]);
  const nationalPrice = parsePriceCell(nationalRow[1]);
  const nationalLink = extractLink(nationalRow[nationalRow.length - 1] || "");
  const nationalDate = cleanCell(nationalRow[2] || "");

  // 其余行是区域
  const regions = table.rows.slice(1).map((r) => ({
    name: cleanCell(r[0]),
    price: parsePriceCell(r[1]).value,
  }));

  return (
    <div className="card">
      <div className="card-head">
        <span className="card-eyebrow">LNG · 国内市场</span>
        <span className="card-head-right">Domestic LNG · SHPGX</span>
      </div>
      <div className="card-body">
        <div className="lng-section">
          <div className="lng-national">
            <div className="price-label">{nationalName}</div>
            <div className="price-main">
              <span className="price-value">{nationalPrice.value}</span>
              <span className="price-unit">{nationalPrice.unit}</span>
            </div>
            <div className="price-meta" style={{ borderTop: "none", paddingTop: 0, marginTop: "8px" }}>
              <span>报价日 <strong>{nationalDate}</strong></span>
              {nationalLink && (
                <a href={nationalLink.url} target="_blank" rel="noopener noreferrer" className="source-btn">
                  {nationalLink.text} ↗
                </a>
              )}
            </div>
          </div>
          <div className="lng-regions">
            {regions.map((r, i) => (
              <div className="lng-region" key={i}>
                <span className="lng-region-name">{r.name}</span>
                <span className="lng-region-price">{r.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 渲染：煤炭（表格） ───
function CoalTableSection({
  tables,
}: {
  tables: { headers: string[]; rows: string[][] }[];
}) {
  const table = tables[0];
  if (!table) return null;

  return (
    <div className="card">
      <div className="card-head">
        <span className="card-eyebrow">煤炭</span>
        <span className="card-head-right">Coal · CCTD</span>
      </div>
      <div style={{ padding: 0 }}>
        <table className="price-table">
          <thead>
            <tr>
              {table.headers.map((h, i) => (
                <th key={i} style={{ textAlign: i === 0 ? "left" : "right" }}>{cleanCell(h)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => {
                  const cleaned = cleanCell(cell);
                  const link = extractLink(cell);
                  const isChange = table.headers[ci]?.includes("涨跌");
                  const dir = isChange ? getChangeDir(cleaned) : null;
                  return (
                    <td
                      key={ci}
                      className={ci === 0 ? "" : isChange ? "num-right" : ci === row.length - 1 ? "action" : "num-right"}
                      style={{ textAlign: ci === 0 ? "left" : "right" }}
                    >
                      {link ? (
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="source-btn">
                          {link.text} ↗
                        </a>
                      ) : isChange && dir ? (
                        <span style={{ color: dir === "up" ? "var(--red)" : dir === "down" ? "var(--ink-secondary)" : "var(--ink-tertiary)", fontWeight: 500 }}>
                          {cleaned}
                        </span>
                      ) : ci === 0 ? (
                        <strong>{cleaned}</strong>
                      ) : (
                        cleaned
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── 渲染：电力市场 ───
function PowerMarketSection({
  policies,
  news,
}: {
  policies: { title: string; summary: string; source: string; sourceUrl: string; publishTime?: string }[];
  news: { title: string; summary: string; source: string; sourceUrl: string; publishTime?: string }[];
}) {
  return (
    <>
      <div className="c-4">
        <div className="card">
          <div className="card-head">
            <span className="card-eyebrow">政策</span>
            <span className="card-head-right">Policies</span>
          </div>
          <div className="card-body">
            <div className="news-list">
              {policies.map((p, i) => (
                <div className="news-item policy" key={i}>
                  <span className="news-tag">⚪ 历史参考</span>
                  <div className="news-title">{p.title}</div>
                  <div className="news-desc">{p.summary}</div>
                  <div className="news-meta">
                    <span>{p.publishTime || ""}</span>
                    <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className="source-btn">
                      {p.source} ↗
                    </a>
                  </div>
                </div>
              ))}
              {policies.length === 0 && <div className="news-desc">暂无政策动态</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="c-8">
        <div className="card">
          <div className="card-head">
            <span className="card-eyebrow">市场动态</span>
            <span className="card-head-right">Market News</span>
          </div>
          <div className="card-body">
            <div className="news-list">
              {news.map((n, i) => (
                <div className="news-item news-policy" key={i}>
                  <div className="news-title">{n.title}</div>
                  <div className="news-desc">{n.summary}</div>
                  <div className="news-meta">
                    <span>{n.source} · {n.publishTime || ""}</span>
                    <a href={n.sourceUrl} target="_blank" rel="noopener noreferrer" className="source-btn">
                      {n.source} ↗
                    </a>
                  </div>
                </div>
              ))}
              {news.length === 0 && <div className="news-desc">暂无市场动态</div>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── 渲染：天气（当日 5 字段，无负荷判断） ───
function WeatherSection({
  weatherData,
}: {
  weatherData: { city: string; weather: string; tempLow: number; tempHigh: number; wind: string }[];
}) {
  if (weatherData.length === 0) return null;

  return (
    <div className="c-12">
      <div className="card">
        <div className="card-head">
          <span className="card-eyebrow">核心负荷区天气</span>
          <span className="card-head-right">Core Load Weather · 今日</span>
        </div>
        <div className="card-body">
          <div className="weather-day-head">
            <div className="weather-day-date">10 城市 · 当日天气</div>
            <div className="weather-day-sum">数据来源 CMA 中央气象台</div>
          </div>
          <div className="weather-grid">
            {weatherData.map((w, i) => {
              const hot = w.tempHigh >= 35;
              const hasRain = w.weather.includes("雨") || w.weather.includes("雪");
              return (
                <div className="weather-cell" key={i}>
                  <div className="weather-cell-city">{w.city}</div>
                  <div className="weather-cell-weather">{w.weather}</div>
                  <div className={`weather-cell-temp ${hot ? "hot" : ""}`}>
                    {w.tempLow}~{w.tempHigh}℃
                  </div>
                  <div className="weather-cell-meta">
                    <span>降水 <strong>{hasRain ? "有" : "无"}</strong></span>
                    <span>风力 <strong>{w.wind}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 渲染：当日总结与评述 ───
function ReviewSection({ content }: { content: string }) {
  // 提取市场画像（blockquote）
  const portraitMatch = content.match(/>\s*\*\*今日市场画像\*\*[：:]\s*([\s\S]+?)(?=\n\n|\n\*\*|\n#|$)/);
  const portrait = portraitMatch ? portraitMatch[1].trim() : "";

  // 提取编号观点（格式：**N. [标签] 标题**\n描述...）
  const itemRegex = /\*\*(\d+)\.\s+\[([^\]]+)\]\s+([^*]+?)\*\*\s*\n([\s\S]*?)(?=\n\*\*\d+\.|\n>|\n---|\n\*|$)/g;
  const items: { tag: string; title: string; desc: string }[] = [];
  let m;
  while ((m = itemRegex.exec(content)) !== null) {
    items.push({
      tag: m[2].trim(),
      title: m[3].trim(),
      desc: m[4].trim().replace(/\n/g, " "),
    });
  }

  return (
    <div className="c-12">
      <div className="card">
        <div className="card-head">
          <span className="card-eyebrow">当日总结与评述</span>
          <span className="card-head-right">Daily Review</span>
        </div>
        <div className="review-wrap">
          {portrait && (
            <div className="review-portrait">
              <div className="review-section-label">市场画像</div>
              <div className="review-headline">{portrait}</div>
            </div>
          )}

          {items.length > 0 && (
            <>
              {portrait && <hr className="review-divider" />}
              <div className="review-section-label">关键观点</div>
              <div className="review-list">
                {items.map((item, i) => (
                  <div className="review-item" key={i}>
                    <div className="review-num">{String(i + 1).padStart(2, "0")}</div>
                    <div>
                      <span className="review-tag">{item.tag}</span>
                      <div className="review-item-title">{item.title}</div>
                      <div className="review-item-desc">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="review-disclaimer">
            以上评述仅基于公开数据客观描述市场现象，不构成任何交易建议。
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 主页面 ───
export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const report = getReportByDate(date);
  if (!report) notFound();

  const adjacent = getAdjacentDates(date);
  const sections = extractSections(report.content);

  // 解析各板块
  let oilTables: { headers: string[]; rows: string[][] }[] = [];
  let gasIntlTables: { headers: string[]; rows: string[][] }[] = [];
  let lngDomesticTables: { headers: string[]; rows: string[][] }[] = [];
  let coalTables: { headers: string[]; rows: string[][] }[] = [];
  let policies: any[] = [];
  let newsItems: any[] = [];
  let weatherData: any[] = [];
  let summaryContent = "";

  for (const section of sections) {
    const heading = section.heading;
    const content = section.content;

    if (heading.includes("原油")) {
      const tables = content.split(/\n### /).flatMap(sub => {
        const t = extractPriceTable(sub.includes("###") ? "###" + sub : sub);
        return t ? [t] : [];
      });
      oilTables = tables;
    } else if (heading.includes("天然气") || heading.includes("LNG")) {
      // 拆分国际市场 / 国内市场
      const intlMatch = content.match(/###\s*国际市场[\s\S]*?(?=###|##|$)/);
      const domesticMatch = content.match(/###\s*国内市场[\s\S]*?(?=###|##|$)/);
      if (intlMatch) {
        const t = extractPriceTable(intlMatch[0]);
        if (t) gasIntlTables = [t];
      }
      if (domesticMatch) {
        const t = extractPriceTable(domesticMatch[0]);
        if (t) lngDomesticTables = [t];
      }
    } else if (heading.includes("煤炭")) {
      const t = extractPriceTable(content);
      if (t) coalTables = [t];
    } else if (heading.includes("电力市场")) {
      policies = extractPolicies(content);
      newsItems = extractMarketNews(content);
    } else if (heading.includes("天气") || heading.includes("负荷区")) {
      weatherData = extractWeatherData(`## ${heading}\n${content}`);
    } else if (heading.includes("总结") || heading.includes("评述")) {
      summaryContent = content;
    }
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Sticky 顶部导航 */}
      <div
        className="sticky top-0 z-40 border-b"
        style={{ background: "var(--bg)", borderColor: "var(--line)" }}
      >
        <div
          className="flex items-center justify-between mx-auto"
          style={{ maxWidth: "var(--max-w)", padding: "12px 24px" }}
        >
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-[11px] transition-colors"
              style={{ color: "var(--ink-secondary)" }}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">返回首页</span>
            </Link>
            <div style={{ width: "1px", height: "16px", background: "var(--line)" }} />
            <Link
              href="/reports"
              className="flex items-center gap-1 text-[11px] transition-colors"
              style={{ color: "var(--ink-secondary)" }}
            >
              <Archive className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">历史归档</span>
            </Link>
          </div>
          <div className="text-[11px]" style={{ color: "var(--ink-secondary)" }}>
            {formatDate(date)} 星期{report.meta.weekday}
          </div>
        </div>
      </div>

      {/* Masthead */}
      <div className="masthead">
        <div>
          <div className="masthead-issue">Daily Report</div>
          <h1>一次能源·电力市场联合日报</h1>
          <div className="masthead-meta">
            {formatDate(date)} · 星期{report.meta.weekday}
          </div>
        </div>
      </div>

      {/* 内容网格 */}
      <div className="content">
        {/* 原油（12列）确保 2 张卡片有足够空间 */}
        {oilTables.length > 0 && (
          <div className="c-12">
            <PriceCardSection title="原油" eyebrowRight="Crude Oil" tables={oilTables} columnsCount={2} />
          </div>
        )}

        {/* 天然气国际（12列）确保 3 张卡片有足够空间 */}
        {gasIntlTables.length > 0 && (
          <div className="c-12">
            <PriceCardSection title="天然气 · 国际" eyebrowRight="Natural Gas · International" tables={gasIntlTables} columnsCount={3} />
          </div>
        )}

        {/* LNG 国内（12列） */}
        {lngDomesticTables.length > 0 && (
          <div className="c-12">
            <LngDomesticSection tables={lngDomesticTables} />
          </div>
        )}

        {/* 煤炭（12列） */}
        {coalTables.length > 0 && (
          <div className="c-12">
            <CoalTableSection tables={coalTables} />
          </div>
        )}

        {/* 电力市场（4+8列） */}
        {(policies.length > 0 || newsItems.length > 0) && (
          <PowerMarketSection policies={policies} news={newsItems} />
        )}

        {/* 天气（12列） */}
        {weatherData.length > 0 && <WeatherSection weatherData={weatherData} />}

        {/* 当日总结（12列） */}
        {summaryContent && <ReviewSection content={summaryContent} />}
      </div>

      {/* 导航 */}
      <div style={{ maxWidth: "var(--max-w)", margin: "0 auto", padding: "0 24px 48px" }}>
        <ReportNav prevDate={adjacent.prev} nextDate={adjacent.next} currentDate={date} />
      </div>
    </div>
  );
}
