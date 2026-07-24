export function Footer() {
  return (
    <footer
      className="border-t mx-auto w-full"
      style={{
        borderColor: 'var(--line)',
        padding: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '10px',
        color: 'var(--ink-tertiary)',
        maxWidth: '1240px',
      }}
    >
      <span>数据来源：TradingEconomics / SHPGX / CCTD / CMA 气象</span>
      <span>能源日报 © {new Date().getFullYear()}</span>
    </footer>
  );
}
