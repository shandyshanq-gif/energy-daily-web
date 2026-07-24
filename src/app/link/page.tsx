import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

interface ChannelItem { title: string; url: string; description: string; category: '政府机关' | '权威媒体'; icon?: string; }

const channels: ChannelItem[] = [
  { title: '国家能源局', url: 'https://www.nea.gov.cn/', description: '能源政策、行业监管、电力市场改革政策发布', category: '政府机关', icon: '⚡' },
  { title: '国家统计局', url: 'https://www.stats.gov.cn/', description: '国民经济统计数据、能源生产消费数据', category: '政府机关', icon: '📊' },
  { title: '中国气象局·CMA', url: 'https://weather.cma.cn/', description: '核心负荷区10城市天气预报（日报天气数据源）', category: '政府机关', icon: '🌤️' },
  { title: '中央气象台·NMC', url: 'https://www.nmc.cn/', description: 'CMA天气API夜间不可用时的降级数据源', category: '政府机关', icon: '🌦️' },
  { title: '国家发展改革委', url: 'https://www.ndrc.gov.cn/', description: '能源价格政策、煤炭中长期合同、电力市场化改革', category: '政府机关', icon: '🏛️' },
  { title: 'Trading Economics · 原油WTI', url: 'https://tradingeconomics.com/commodity/crude-oil', description: 'WTI原油期货价格（含日/月/同比涨跌数据）', category: '权威媒体', icon: '🛢️' },
  { title: 'Trading Economics · 原油Brent', url: 'https://tradingeconomics.com/commodity/brent-crude-oil', description: 'Brent原油期货价格（含日/月/同比涨跌数据）', category: '权威媒体', icon: '🛢️' },
  { title: 'Trading Economics · JKM LNG', url: 'https://zh.tradingeconomics.com/commodity/liquefied-natural-gas-japan-korea', description: 'JKM LNG现货价格（3~50 USD/MMBtu有效范围）', category: '权威媒体', icon: '🔥' },
  { title: '上海石油天然气交易中心·SHPGX', url: 'https://www.shpgx.com/', description: 'LNG全国均价及16区域价（JSON API直采）', category: '权威媒体', icon: '🔥' },
  { title: '中国煤炭市场网·CCTD', url: 'https://www.cctd.com.cn/', description: '动力煤7品种价格（平仓价/坑口价/出厂价）', category: '权威媒体', icon: '⛏️' },
  { title: '北极星电力网', url: 'https://www.bjx.com.cn/', description: '电力市场政策、交易规则、现货动态综合资讯', category: '权威媒体', icon: '📰' },
  { title: '北京电力交易中心', url: 'https://pmos.sgcc.com.cn/', description: '电力中长期交易、绿电绿证交易信息披露', category: '权威媒体', icon: '📈' },
  { title: '广州电力交易中心', url: 'https://www.gzpec.cn/', description: '南方区域电力市场交易信息披露', category: '权威媒体', icon: '📈' },
];

const groupedChannels = channels.reduce<Record<string, ChannelItem[]>>((acc, ch) => {
  if (!acc[ch.category]) acc[ch.category] = [];
  acc[ch.category].push(ch);
  return acc;
}, {});

const categoryOrder = ['政府机关', '权威媒体'];
const categoryDesc: Record<string, string> = {
  '政府机关': '国家级部委及直属机构，政策权威发布',
  '权威媒体': '行业数据平台、交易中心及专业资讯媒体',
};

export default function InfoChannelPage() {
  return (
    <div className="flex flex-col min-h-full">
      {/* Masthead */}
      <div className="masthead">
        <div>
          <div className="masthead-issue">Channels</div>
          <h1>信息渠道库</h1>
          <div className="masthead-meta">日报工作流实际使用的全部信息渠道 · 共 {channels.length} 个</div>
        </div>
      </div>

      {/* 内容 */}
      <div className="content">
        {categoryOrder.map((cat) => {
          const items = groupedChannels[cat];
          if (!items || items.length === 0) return null;
          return (
            <div className="c-12" key={cat}>
              <div className="card">
                <div className="card-head">
                  <span className="card-eyebrow">{cat}</span>
                  <span className="card-head-right">{items.length} 个渠道</span>
                </div>
                <div className="card-body">
                  <p className="text-[11px] mb-4" style={{ color: "var(--ink-secondary)" }}>
                    {categoryDesc[cat]}
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                      gap: "1px",
                      background: "var(--line-subtle)",
                    }}
                  >
                    {items.map((ch, idx) => (
                      <a
                        key={idx}
                        href={ch.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="channel-link group"
                        style={{
                          background: "var(--bg)",
                          padding: "16px",
                          borderLeft: "2px solid transparent",
                          display: "block",
                          transition: "border-color 0.15s, background 0.15s",
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              {ch.icon && <span style={{ fontSize: "14px" }}>{ch.icon}</span>}
                              <h4 style={{ fontSize: "13px", fontWeight: 600, color: "var(--ink-primary)" }}>
                                {ch.title}
                              </h4>
                            </div>
                            <p className="text-[10px] mt-1.5 leading-relaxed" style={{ color: "var(--ink-secondary)" }}>
                              {ch.description}
                            </p>
                          </div>
                          <ExternalLink
                            className="h-3 w-3 flex-shrink-0 transition-colors"
                            style={{ color: "var(--ink-tertiary)" }}
                          />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}