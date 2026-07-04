"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ExternalLink, ArrowLeft, Search, Globe, Shield, Zap } from "lucide-react";

interface LinkItem {
  title: string;
  url: string;
  description: string;
  category: string;
  icon?: string;
}

// 预定义的链接列表
const links: LinkItem[] = [
  // 能源数据源
  {
    title: "国家能源局",
    url: "https://www.nea.gov.cn/",
    description: "国家能源局官方网站，发布能源政策、行业动态和统计数据",
    category: "能源数据源",
    icon: "⚡",
  },
  {
    title: "中国石油天然气集团公司",
    url: "https://www.cnpc.com.cn/",
    description: "中国石油官方网站，提供石油天然气行业信息",
    category: "能源数据源",
    icon: "🛢️",
  },
  {
    title: "中国煤炭工业协会",
    url: "http://www.coalchina.org.cn/",
    description: "中国煤炭工业协会官方网站，发布煤炭行业政策和数据",
    category: "能源数据源",
    icon: "⛏️",
  },
  {
    title: "国家统计局",
    url: "https://www.stats.gov.cn/",
    description: "国家统计局官方网站，发布国民经济统计数据",
    category: "能源数据源",
    icon: "📊",
  },
  
  // 电力市场
  {
    title: "国家电网有限公司",
    url: "https://www.sgcc.com.cn/",
    description: "国家电网官方网站，提供电力市场信息和服务",
    category: "电力市场",
    icon: "🔌",
  },
  {
    title: "中国南方电网有限责任公司",
    url: "https://www.csg.cn/",
    description: "南方电网官方网站，提供南方区域电力市场信息",
    category: "电力市场",
    icon: "🔌",
  },
  {
    title: "北京电力交易中心",
    url: "http://pmo.sgcc.com.cn/portal/index.html",
    description: "北京电力交易中心，提供电力交易信息和服务",
    category: "电力市场",
    icon: "📈",
  },
  
  // 行业资讯
  {
    title: "中国能源网",
    url: "http://www.cnenergy.org/",
    description: "中国能源行业综合资讯网站",
    category: "行业资讯",
    icon: "🌐",
  },
  {
    title: "国际能源署",
    url: "https://www.iea.org/",
    description: "国际能源署官方网站，提供全球能源数据分析和预测",
    category: "行业资讯",
    icon: "🌍",
  },
  {
    title: "隆众资讯",
    url: "https://www.oilchem.net/",
    description: "隆众资讯，提供能源化工行业数据和资讯",
    category: "行业资讯",
    icon: "📰",
  },
];

export default function LinkPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLinks, setFilteredLinks] = useState<LinkItem[]>(links);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // 获取所有分类
  const categories = ["all", ...Array.from(new Set(links.map((link) => link.category)))];

  // 根据搜索查询和分类过滤链接
  useEffect(() => {
    let result = links;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (link) =>
          link.title.toLowerCase().includes(query) ||
          link.description.toLowerCase().includes(query) ||
          link.category.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== "all") {
      result = result.filter((link) => link.category === selectedCategory);
    }

    setFilteredLinks(result);
  }, [searchQuery, selectedCategory]);

  return (
    <div className="flex-1">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors dark:text-gray-400 dark:hover:text-gray-100"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">返回首页</span>
              </Link>
              <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                相关链接
              </h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Globe className="h-4 w-4" />
              <span>能源行业资源</span>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        {/* Search and filter */}
        <div className="mb-8 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索链接..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:border-blue-400"
            />
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white dark:bg-blue-500"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {category === "all" ? "全部" : category}
              </button>
            ))}
          </div>
        </div>

        {/* Links grid */}
        {filteredLinks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-20 text-center dark:border-gray-700">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              未找到匹配的链接
            </h3>
            <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
              尝试使用不同的关键词搜索或选择其他分类
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-xl border border-gray-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-600"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {link.icon && <span className="text-lg">{link.icon}</span>}
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                      {link.title}
                    </h3>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400 transition-colors group-hover:text-blue-500" />
                </div>
                <p className="mb-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {link.description}
                </p>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    {link.category}
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 border-t border-gray-200 pt-6 pb-8 dark:border-gray-700">
          <div className="flex flex-col items-center gap-2 text-center text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Shield className="h-3 w-3" />
              <p>所有链接均指向官方网站或权威数据源</p>
            </div>
            <p>如有链接失效或错误，请联系我们</p>
          </div>
        </footer>
      </main>
    </div>
  );
}