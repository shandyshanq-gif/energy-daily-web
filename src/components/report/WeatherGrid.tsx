interface WeatherData {
  city: string;
  weather: string;
  tempLow: number;
  tempHigh: number;
  wind: string;
}

interface WeatherGridProps {
  weatherData: WeatherData[];
}

/**
 * 从天气描述推断降水情况
 */
function getPrecipitation(weather: string): string {
  if (weather.includes("雨") || weather.includes("雪")) return "有";
  return "无";
}

/**
 * 判断是否为高温（≥35°C）
 */
function isHot(tempHigh: number): boolean {
  return tempHigh >= 35;
}

export default function WeatherGrid({ weatherData }: WeatherGridProps) {
  if (weatherData.length === 0) return null;

  return (
    <div>
      <div
        className="flex items-baseline gap-3"
        style={{ marginBottom: '16px' }}
      >
        <div className="text-[14px] font-semibold">当日天气</div>
        <div className="text-[11px]" style={{ color: 'var(--ink-secondary)' }}>
          {weatherData.length} 城市 · 数据来源 CMA 中央气象台
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '1px',
          background: 'var(--line-subtle)',
        }}
      >
        {weatherData.map((weather, idx) => {
          const hot = isHot(weather.tempHigh);
          return (
            <div
              key={idx}
              style={{
                background: 'var(--bg)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div className="text-[14px] font-semibold">{weather.city}</div>
              <div className="text-[11px]" style={{ color: 'var(--ink-secondary)' }}>
                {weather.weather}
              </div>
              <div
                className="tabular"
                style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  letterSpacing: '-0.02em',
                  margin: '4px 0',
                  lineHeight: '1',
                  color: hot ? 'var(--red)' : 'var(--ink-primary)',
                }}
              >
                {weather.tempLow}~{weather.tempHigh}℃
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--line-subtle)',
                  fontSize: '10px',
                  color: 'var(--ink-tertiary)',
                }}
              >
                <span style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>降水</span>
                  <strong style={{ color: 'var(--ink-secondary)', fontWeight: '500' }}>
                    {getPrecipitation(weather.weather)}
                  </strong>
                </span>
                <span style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>风力</span>
                  <strong style={{ color: 'var(--ink-secondary)', fontWeight: '500' }}>
                    {weather.wind}
                  </strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
