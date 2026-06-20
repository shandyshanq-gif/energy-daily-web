"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ReportNavProps {
  prevDate: string | null;
  nextDate: string | null;
  currentDate: string;
}

function formatDateShort(date: string): string {
  const [y, m, d] = date.split("-");
  return `${parseInt(m)}月${parseInt(d)}日`;
}

export default function ReportNav({
  prevDate,
  nextDate,
  currentDate,
}: ReportNavProps) {
  return (
    <nav
      className="flex items-center justify-between gap-4 border-t border-gray-100 pt-6 dark:border-gray-800"
      aria-label="报告导航"
    >
      {/* Previous button */}
      <div className="flex-1 text-left">
        {prevDate ? (
          <Link href={`/reports/${prevDate}`}>
            <Button variant="ghost" className="group h-auto flex-col items-start py-2">
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <ChevronLeft className="h-3.5 w-3.5" />
                上一篇
              </span>
              <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                {formatDateShort(prevDate)}
              </span>
            </Button>
          </Link>
        ) : (
          <Button
            variant="ghost"
            disabled
            className="h-auto flex-col items-start py-2 opacity-40"
          >
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <ChevronLeft className="h-3.5 w-3.5" />
              上一篇
            </span>
          </Button>
        )}
      </div>

      {/* Current date indicator */}
      <div className="hidden text-center sm:block">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {formatDateShort(currentDate)}
        </span>
      </div>

      {/* Next button */}
      <div className="flex-1 text-right">
        {nextDate ? (
          <Link href={`/reports/${nextDate}`}>
            <Button
              variant="ghost"
              className="group h-auto flex-col items-end py-2"
            >
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                下一篇
                <ChevronRight className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                {formatDateShort(nextDate)}
              </span>
            </Button>
          </Link>
        ) : (
          <Button
            variant="ghost"
            disabled
            className="h-auto flex-col items-end py-2 opacity-40"
          >
            <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              下一篇
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </Button>
        )}
      </div>
    </nav>
  );
}
