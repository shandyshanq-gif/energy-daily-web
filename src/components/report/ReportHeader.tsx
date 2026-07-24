import { Calendar } from "lucide-react";

interface ReportHeaderProps { date: string; weekday: string; }

export default function ReportHeader({ date, weekday }: ReportHeaderProps) {
  const [y, m, d] = date.split("-");
  return (
    <header className="mb-10">
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">一次能源·电力市场联合日报</h1>
      <div className="mt-3 flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /><time dateTime={date} className="text-sm font-medium">{y}年{parseInt(m)}月{parseInt(d)}日 星期{weekday}</time></div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">本报告综合呈现国内一次能源（煤炭、原油、天然气）及电力市场的核心价格数据、关键政策动态与负荷区天气情况，为能源行业从业者提供决策参考。</p>
    </header>
  );
}
