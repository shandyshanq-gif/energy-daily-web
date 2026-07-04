import Link from "next/link";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportCardProps {
  date: string;
  weekday: string;
  isLatest?: boolean;
}

function formatDateDisplay(date: string, weekday: string): string {
  const [y, m, d] = date.split("-");
  return `${y}年${parseInt(m)}月${parseInt(d)}日 星期${weekday}`;
}

export default function ReportCard({
  date,
  weekday,
  isLatest = false,
}: ReportCardProps) {
  const [y, m, d] = date.split("-");
  const monthDay = `${parseInt(m)}月${parseInt(d)}日`;

  return (
    <Link
      href={`/reports/${date}`}
      className={cn(
        "group relative block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-700",
        isLatest && "border-blue-200 dark:border-blue-800"
      )}
    >
      {/* Latest badge */}
      {isLatest && (
        <span className="absolute -right-1 -top-1 inline-flex items-center rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white dark:bg-blue-500">
          最新
        </span>
      )}

      {/* Date */}
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <Calendar className="h-4 w-4" />
        <time dateTime={date} className="text-xs font-medium">
          {monthDay}
        </time>
      </div>

      {/* Title */}
      <h3 className="mt-2 text-sm font-semibold leading-snug text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
        一次能源·电力市场联合日报
      </h3>

      {/* Weekday */}
      <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
        星期{weekday}
      </p>
    </Link>
  );
}