export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="flex flex-col items-center justify-center gap-2 px-4 py-6 text-center">
        <p className="text-xs text-muted-foreground">
          一次能源·电力市场联合日报 · 数据来源：公开市场数据 · 仅供参考，不构成投资建议
        </p>
        <p className="text-[11px] text-muted-foreground/60">
          © {new Date().getFullYear()} 能源日报系统
        </p>
      </div>
    </footer>
  );
}
