interface ReportHeaderProps {
  date: string;
  weekday: string;
  issueNumber?: number;
}

export default function ReportHeader({ date, weekday, issueNumber }: ReportHeaderProps) {
  const [y, m, d] = date.split("-");
  return (
    <div
      className="flex items-end justify-between mx-auto"
      style={{
        maxWidth: '1240px',
        padding: '32px 24px 24px',
        gap: '24px',
      }}
    >
      <div>
        {issueNumber && (
          <div className="eyebrow" style={{ marginBottom: '8px' }}>
            Daily Report · 第 {issueNumber} 期
          </div>
        )}
        <h1
          className="headline"
          style={{ fontSize: '22px' }}
        >
          一次能源·电力市场联合日报
        </h1>
        <div
          className="text-[11px]"
          style={{ color: 'var(--ink-secondary)', marginTop: '8px' }}
        >
          {y}年{parseInt(m)}月{parseInt(d)}日 · 星期{weekday}
        </div>
      </div>
      <a
        href="/dashboard"
        className="source-btn"
        style={{ height: '28px', fontSize: '11px', borderColor: 'var(--ink-primary)' }}
      >
        ↗ 数据看板
      </a>
    </div>
  );
}
