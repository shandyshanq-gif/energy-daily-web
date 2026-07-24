import { FileText, ExternalLink, Zap } from "lucide-react";

interface PolicyItem { title: string; summary: string; source: string; sourceUrl: string; publishTime?: string; }
interface MarketNewsItem { title: string; summary: string; source: string; sourceUrl: string; publishTime?: string; }
interface PolicySectionProps { policies: PolicyItem[]; news: MarketNewsItem[]; }

export default function PolicySection({ policies, news }: PolicySectionProps) {
  if (policies.length === 0 && news.length === 0) return null;
  return (
    <div className="space-y-6">
      {policies.length > 0 && (<div className="space-y-3">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground"><FileText className="h-4 w-4 text-accent" />政策动态</h4>
        <div className="space-y-2">{policies.map((policy, idx) => (
          <div key={idx} className="rounded-lg border border-border bg-card p-4 transition-all hover:border-accent/30 hover:shadow-sm">
            <div className="flex items-start justify-between gap-2"><div className="flex-1 min-w-0">
              <div className="flex items-center gap-2"><h5 className="text-sm font-semibold text-foreground">{policy.title}</h5>{policy.sourceUrl && <a href={policy.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 text-muted-foreground/50 hover:text-accent transition-colors"><ExternalLink className="h-3 w-3" /></a>}</div>
              <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground"><span className="font-medium">{policy.source}</span>{policy.publishTime && <><span className="text-border">·</span><span>{policy.publishTime}</span></>}</div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{policy.summary}</p>
            </div></div>
          </div>
        ))}</div>
      </div>)}
      {news.length > 0 && (<div className="space-y-3">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground"><Zap className="h-4 w-4 text-accent" />市场动态</h4>
        <div className="space-y-2">{news.map((item, idx) => (
          <div key={idx} className="rounded-lg border border-border bg-card p-4 transition-all hover:border-accent/30 hover:shadow-sm">
            <div className="flex items-start justify-between gap-2"><div className="flex-1 min-w-0">
              <div className="flex items-center gap-2"><h5 className="text-sm font-semibold text-foreground">{item.title}</h5>{item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 text-muted-foreground/50 hover:text-accent transition-colors"><ExternalLink className="h-3 w-3" /></a>}</div>
              <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground"><span className="font-medium">{item.source}</span>{item.publishTime && <><span className="text-border">·</span><span>{item.publishTime}</span></>}</div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.summary}</p>
            </div></div>
          </div>
        ))}</div>
      </div>)}
    </div>
  );
}
