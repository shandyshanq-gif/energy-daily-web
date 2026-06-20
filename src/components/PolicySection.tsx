import { ExternalLink } from "lucide-react";
import type { PolicyItem, MarketNewsItem } from "@/lib/markdown";

interface PolicySectionProps {
  policies: PolicyItem[];
  news: MarketNewsItem[];
}

function ItemCard({
  item,
}: {
  item: { title: string; summary: string; source: string; sourceUrl: string };
}) {
  return (
    <div className="group rounded-lg border border-gray-100 bg-white p-4 transition-all hover:border-gray-200 hover:shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-medium leading-snug text-gray-900 dark:text-gray-100">
            {item.title}
          </h4>
          <p className="mt-1.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            {item.summary}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
          {item.source}
        </span>
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 opacity-0 transition-opacity hover:text-blue-700 group-hover:opacity-100 dark:text-blue-400 dark:hover:text-blue-300"
        >
          查看原文
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

export default function PolicySection({ policies, news }: PolicySectionProps) {
  const hasPolicies = policies.length > 0;
  const hasNews = news.length > 0;

  if (!hasPolicies && !hasNews) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
        暂无政策和市场动态数据
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 政策 */}
      {hasPolicies && (
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
            <span>🏛️</span> 政策
          </h3>
          <div className="space-y-2">
            {policies.map((policy, idx) => (
              <ItemCard key={idx} item={policy} />
            ))}
          </div>
        </section>
      )}

      {/* 市场动态 */}
      {hasNews && (
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
            <span>📰</span> 市场动态
          </h3>
          <div className="space-y-2">
            {news.map((item, idx) => (
              <ItemCard key={idx} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
