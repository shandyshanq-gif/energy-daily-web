import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceTableProps { title: string; headers: string[]; rows: string[][]; icon?: React.ReactNode; }

function getChangeInfo(value: string): { direction: "up" | "down" | "flat"; displayValue: string } {
  if (value.includes("↑")) return { direction: "up", displayValue: value };
  if (value.includes("↓")) return { direction: "down", displayValue: value };
  const trimmed = value.trim();
  if (trimmed === "—" || trimmed === "-" || trimmed === "" || trimmed === "0") return { direction: "flat", displayValue: trimmed || "—" };
  return { direction: "flat", displayValue: value };
}

function ChangeIcon({ direction }: { direction: "up" | "down" | "flat" }) {
  if (direction === "up") return <TrendingUp className="inline-block h-3.5 w-3.5" />;
  if (direction === "down") return <TrendingDown className="inline-block h-3.5 w-3.5" />;
  return <Minus className="inline-block h-3.5 w-3.5" />;
}

export default function PriceTable({ title, headers, rows, icon }: PriceTableProps) {
  const changeColumnIndices = headers.reduce<number[]>((acc, header, idx) => {
    const lower = header.toLowerCase();
    if (lower.includes("涨跌") || lower.includes("变化") || lower.includes("较上") || lower.includes("环比") || lower.includes("同比") || lower.includes("change") || lower.includes("日变动")) acc.push(idx);
    return acc;
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {title && (<div className="flex items-center gap-2 border-b border-border px-5 py-3.5">{icon && <span className="text-muted-foreground">{icon}</span>}<h3 className="text-sm font-semibold text-foreground">{title}</h3></div>)}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] table-auto">
          <thead><tr className="border-b border-border">{headers.map((header, idx) => (<th key={idx} className={cn("whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground", idx === 0 && "pl-5", idx === headers.length - 1 && "pr-5")}>{header}</th>))}</tr></thead>
          <tbody className="divide-y divide-border">
            {rows.map((row, rowIdx) => (<tr key={rowIdx} className={cn("transition-colors hover:bg-muted/50", rowIdx % 2 === 0 ? "bg-card" : "bg-muted/30")}>
              {row.map((cell, cellIdx) => {
                const isChangeColumn = changeColumnIndices.includes(cellIdx);
                const changeInfo = isChangeColumn ? getChangeInfo(cell) : null;
                return (<td key={cellIdx} className={cn("whitespace-nowrap px-4 py-2.5 text-sm", cellIdx === 0 && "font-medium text-foreground", cellIdx === 0 && "pl-5", cellIdx === row.length - 1 && "pr-5", changeInfo && "font-medium")}>
                  {changeInfo ? (<span className={cn("inline-flex items-center gap-1", changeInfo.direction === "up" && "text-rose-600 dark:text-rose-400", changeInfo.direction === "down" && "text-emerald-600 dark:text-emerald-400", changeInfo.direction === "flat" && "text-slate-400 dark:text-slate-500")}><ChangeIcon direction={changeInfo.direction} />{changeInfo.displayValue}</span>) : (<span className="text-foreground/80">{cell}</span>)}
                </td>);
              })}
            </tr>))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
