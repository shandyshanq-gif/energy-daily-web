import { FileText, ExternalLink, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface PolicyItem {
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
}

interface MarketNewsItem {
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
}

interface PolicySectionProps {
  policies: PolicyItem[];
  news: MarketNewsItem[];
}

export default function PolicySection({ policies, news }: PolicySectionProps) {
  if (policies.length === 0 && news.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Policy section */}
      {policies.length > 0 && (
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <FileText className="h-4 w-4" />
            政策动态
          </h4>
          <div className="space-y-2">
            {policies.map((policy, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 transition-colors hover:bg-gray-100/50 dark:border-gray-800 dark:bg-gray-800/30 dark:hover:bg-gray-800/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {policy.title}
                      </h5>
                      {policy.sourceUrl && (
                        <a
                          href={policy.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{policy.source}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      {policy.summary}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Market news section */}
      {news.length > 0 && (
        <div className="space-y-3">
          <h4 className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Zap className="h-4 w-4" />
            市场动态
          </h4>
          <div className="space-y-2">
            {news.map((item, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 transition-colors hover:bg-gray-100/50 dark:border-gray-800 dark:bg-gray-800/30 dark:hover:bg-gray-800/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {item.title}
                      </h5>
                      {item.sourceUrl && (
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{item.source}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      {item.summary}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}