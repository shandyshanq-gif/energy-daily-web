import SourceButton from "./SourceButton";

interface PolicyItem {
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  publishTime?: string;
}
interface MarketNewsItem {
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  publishTime?: string;
}
interface PolicySectionProps {
  policies: PolicyItem[];
  news: MarketNewsItem[];
}

export default function PolicySection({ policies, news }: PolicySectionProps) {
  if (policies.length === 0 && news.length === 0) return null;

  return (
    <div className="space-y-6">
      {policies.length > 0 && (
        <div className="space-y-3">
          <div className="eyebrow">政策</div>
          <div className="space-y-2">
            {policies.map((policy, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px 16px',
                  borderLeft: '2px solid var(--red)',
                  paddingLeft: '16px',
                  marginLeft: '-16px',
                }}
              >
                <div className="text-[13px] font-semibold" style={{ marginBottom: '4px' }}>
                  {policy.title}
                </div>
                <div className="text-[11px]" style={{ color: 'var(--ink-secondary)', marginBottom: '8px', lineHeight: '1.5' }}>
                  {policy.summary}
                </div>
                <div
                  className="flex justify-between items-center text-[10px]"
                  style={{ color: 'var(--ink-tertiary)' }}
                >
                  <span>{policy.publishTime || ''}</span>
                  <SourceButton source={policy.source} url={policy.sourceUrl} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {news.length > 0 && (
        <div className="space-y-3">
          <div className="eyebrow">市场动态</div>
          <div className="space-y-2">
            {news.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px 16px',
                  borderLeft: '2px solid var(--ink-primary)',
                  paddingLeft: '16px',
                  marginLeft: '-16px',
                }}
              >
                <div className="text-[13px] font-semibold" style={{ marginBottom: '4px' }}>
                  {item.title}
                </div>
                <div className="text-[11px]" style={{ color: 'var(--ink-secondary)', marginBottom: '8px', lineHeight: '1.5' }}>
                  {item.summary}
                </div>
                <div
                  className="flex justify-between items-center text-[10px]"
                  style={{ color: 'var(--ink-tertiary)' }}
                >
                  <span>{item.publishTime || ''}</span>
                  <SourceButton source={item.source} url={item.sourceUrl} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
