'use client';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Building2, Globe, UserRound, Info } from 'lucide-react';

interface ChannelItem { title: string; url: string; description: string; category: '政府机关' | '权威媒体' | '自媒体'; icon?: string; }

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
  { title: '北京电��交易中心', url: 'https://pmos.sgcc.com.cn/', description: '电力中长期交易、绿电绿证交易信息披露', category: '权威媒体', icon: '📈' },
  { title: '广州电力交易中心', url: 'https://www.gzpec.cn/', description: '南方区域电力市场交易信息披露', category: '权威媒体', icon: '📈' },
];

const groupedChannels = channels.reduce<Record<string, ChannelItem[]>>((acc, ch) => { if (!acc[ch.category]) acc[ch.category] = []; acc[ch.category].push(ch); return acc; }, {});

const categoryMeta: Record<string, { icon: React.ReactNode; color: string; desc: string }> = {
  '政府机关': { icon: <Building2 className="h-5 w-5" />, color: 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20', desc: '国家级部委及直属机构，政策权威发布' },
  '权威媒体': { icon: <Globe className="h-5 w-5" />, color: 'border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20', desc: '行业数据平台、交易中心及专业资讯媒体' },
  '自媒体': { icon: <UserRound className="h-5 w-5" />, color: 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20', desc: '行业分析师、独立研究机构及个人观点' },
};

const categoryOrder = ['政府机关', '权威媒体', '自媒体'];

export default function InfoChannelPage() {
  return (
    <div className="flex flex-col min-h-full">
      <div className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">返回首页</span></Link>
            <div className="h-4 w-px bg-border" />
            <h1 className="text-sm font-semibold text-foreground">信息渠道库</h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Info className="h-3.5 w-3.5" /><span>日报工作流真实数据源</span></div>
        </div>
      </div>
      <div className="flex-1 mx-auto w-full max-w-4xl px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-bold tracking-tight text-foreground">信息渠道库</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">以下为本日报工作流中实际使用的全部信息渠道链接，按照渠道属性分为政府机关、权威媒体、自媒体三类，便于查阅与溯源。</p>
        </div>
        <div className="space-y-10">
          {categoryOrder.map((cat) => {
            const items = groupedChannels[cat];
            if (!items || items.length === 0) return null;
            const meta = categoryMeta[cat];
            return (
              <section key={cat}>
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-foreground">{meta.icon}</span>
                  <h3 className="text-base font-semibold text-foreground">{cat}</h3>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{items.length} 个渠道</span>
                </div>
                <p className="mb-4 text-sm text-muted-foreground">{meta.desc}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {items.map((ch, idx) => (
                    <a key={idx} href={ch.url} target="_blank" rel="noopener noreferrer" className={`group block rounded-lg border border-border bg-card p-4 border-l-[3px] transition-all hover:shadow-sm hover:-translate-y-0.5 ${meta.color}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {ch.icon && <span className="text-base flex-shrink-0">{ch.icon}</span>}
                            <h4 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors truncate">{ch.title}</h4>
                          </div>
                          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{ch.description}</p>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground/40 group-hover:text-accent transition-colors" />
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
        <div className="mt-12 border-t border-border pt-6">
          <div className="flex flex-col items-center gap-1 text-center text-xs text-muted-foreground">
            <p>以上链接均来自日报工作流实际使用的数据源</p>
            <p>如有链接失效，请及时反馈更新</p>
          </div>
        </div>
      </div>
    </div>
  );
}
