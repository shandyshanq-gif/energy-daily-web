"use client";
import { useState, useEffect } from "react";
import { ExternalLink, Newspaper, Building2, Database } from "lucide-react";

interface ChannelItem {
  title: string;
  url: string;
  description: string;
  category: string;
  level: string;
  carrier: string;
  icon?: string;
}

const CARRIER_ICONS: Record<string, typeof Newspaper> = {
  wechat: Newspaper,
  portal: Building2,
};

const CATEGORY_ORDER = ['政府机关', '行业媒体', '数据平台', '交易中心', '其他'];
const CATEGORY_DESC: Record<string, string> = {
  '政府机关': '国家级部委及直属机构，政策权威发布',
  '行业媒体': '电力行业公众号及垂直媒体，市场动态与深度分析',
  '数据平台': '数据平台及交易中心，价格数据与交易信息',
  '交易中心': '电力交易中心，交易规则与市场运行数据',
};

function LoadingSkeleton() {
  return (
    <div className="flex flex-col min-h-full">
      <div className="masthead">
        <div>
          <div className="masthead-issue">Channels</div>
          <h1>信息渠道库</h1>
        </div>
      </div>
      <div className="content">
        {Array.from({ length: 3 }).map((_, i) => (
          <div className="c-12" key={i}>
            <div className="card">
              <div className="card-body" style={{ padding: "20px" }}>
                <div className="h-4 w-24 bg-[var(--bg-soft)] animate-pulse rounded mb-3" />
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="h-20 bg-[var(--bg-soft)] animate-pulse rounded" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InfoChannelPage() {
  const [channels, setChannels] = useState<ChannelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data/channels.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setChannels(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // 按渠道分类分组
  const grouped = channels.reduce<Record<string, ChannelItem[]>>((acc, ch) => {
    const cat = ch.category || '其他';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ch);
    return acc;
  }, {});

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="flex flex-col min-h-full">
      {/* Masthead */}
      <div className="masthead">
        <div>
          <div className="masthead-issue">Channels</div>
          <h1>信息渠道库</h1>
          <div className="masthead-meta">
            {error
              ? "数据加载失败"
              : `日报工作流实际使用的全部信息渠道 · 共 ${channels.length} 个`}
          </div>
        </div>
      </div>

      {/* 内容 */}
      <div className="content">
        {error ? (
          <div className="c-12">
            <div className="card">
              <div className="card-body" style={{ textAlign: "center", padding: "64px 24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600 }}>渠道数据加载失败</h3>
                <p className="text-[11px] mt-2" style={{ color: "var(--ink-tertiary)" }}>{error}</p>
              </div>
            </div>
          </div>
        ) : (
          CATEGORY_ORDER.map((cat) => {
            const items = grouped[cat];
            if (!items || items.length === 0) return null;
            return (
              <div className="c-12" key={cat}>
                <div className="card">
                  <div className="card-head" style={{ borderBottom: "2px solid var(--red)" }}>
                    <span className="card-eyebrow">{cat}</span>
                    <span className="card-head-right">{items.length} 个渠道</span>
                  </div>
                  <div className="card-body">
                    {CATEGORY_DESC[cat] && (
                      <p className="text-[11px] mb-4" style={{ color: "var(--ink-secondary)" }}>
                        {CATEGORY_DESC[cat]}
                      </p>
                    )}
                    <div
                      className="grid gap-3"
                      style={{
                        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                      }}
                    >
                      {items.map((ch, idx) => {
                        const IconComponent = CARRIER_ICONS[ch.carrier] || Database;
                        const isClickable = ch.url && ch.url !== '#';
                        const content = (
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <IconComponent className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "var(--ink-tertiary)" }} />
                                <h4 style={{ fontSize: "13px", fontWeight: 600, color: "var(--ink-primary)" }}>
                                  {ch.title}
                                </h4>
                                {ch.level && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded" style={{
                                    background: ch.level === 'S' ? 'var(--red-dim)' : 'var(--bg-soft)',
                                    color: ch.level === 'S' ? 'var(--red)' : 'var(--ink-tertiary)',
                                    border: '1px solid var(--line)',
                                  }}>
                                    {ch.level}级
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] mt-1.5 leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
                                {ch.description}
                              </p>
                            </div>
                            {isClickable && (
                              <ExternalLink className="h-3 w-3 flex-shrink-0" style={{ color: "var(--ink-tertiary)" }} />
                            )}
                          </div>
                        );

                        if (isClickable) {
                          return (
                            <a
                              key={idx}
                              href={ch.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block rounded-lg border border-[var(--line)] hover:border-[var(--ink-quaternary)] transition-all duration-200 hover:shadow-sm cursor-pointer"
                              style={{
                                background: "var(--bg)",
                                padding: "16px",
                                borderLeft: "2px solid transparent",
                              }}
                            >
                              {content}
                            </a>
                          );
                        }
                        return (
                          <div
                            key={idx}
                            className="block rounded-lg border border-[var(--line)]"
                            style={{
                              background: "var(--bg)",
                              padding: "16px",
                              borderLeft: "2px solid var(--line-subtle)",
                              opacity: 0.8,
                            }}
                          >
                            {content}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}