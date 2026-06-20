# 能源日报网页化部署文档

> **版本**：v1.0 | **日期**：2026-06-20 | **仓库**：[shandyshanq-gif/energy-daily-web](https://github.com/shandyshanq-gif/energy-daily-web)
>
> **线上地址**：https://energy-daily-web.pages.dev

---

## 0. 文档导航

| 章节 | 内容 | 适用读者 |
|:-----|:-----|:---------|
| §1 | 项目概述与架构 | 所有人 |
| §2 | 环境准备 | 开发/运维 |
| §3 | 从零创建项目（完整复现） | 开发 |
| §4 | 关键配置文件说明 | 开发/运维 |
| §5 | 部署到 Cloudflare Pages | 运维 |
| §6 | 每日自动更新流程 | 运维/AI Agent |
| §7 | 踩坑记录与故障排查 | 所有人 |
| §8 | 文件清单 | 验收 |

---

## 1. 项目概述与架构

### 1.1 项目目标

将一次能源·电力市场联合日报从纯 Markdown 输出升级为**公网可访问的网页站点**，支持：
- 历史日报浏览（按日期归档）
- 现代 Dashboard 风格（浅色/深色双模式）
- 每日自动更新（git push 触发重新部署）
- 内部链接分享

### 1.2 技术栈

| 技术 | 版本 | 用途 |
|:-----|:-----|:-----|
| Next.js | 16.2.9 | React 框架，SSG 静态导出 |
| React | 19.2.4 | UI 库 |
| TypeScript | 5.9.x | 类型安全 |
| Tailwind CSS | 4.3.x | 原子化 CSS（v4，无 config 文件） |
| Cloudflare Pages | — | 静态站点托管 |
| GitHub | — | 代码仓库 + 自动部署触发 |

### 1.3 架构全景

```
                    ┌─────────────────────────┐
                    │    日报 Markdown 源文件    │
                    │  energy_daily_YYYY-MM-DD │
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │  update_web_data.py     │
                    │  (同步脚本)              │
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │  energy-daily-web/      │
                    │  data/reports/*.md      │
                    │  (Git 仓库)              │
                    └───────────┬─────────────┘
                                │ git push
                    ┌───────────▼─────────────┐
                    │  Cloudflare Pages       │
                    │  自动构建 + 部署         │
                    └───────────┬─────────────┘
                                │
                    ┌───────────▼─────────────┐
                    │  energy-daily-web       │
                    │  .pages.dev             │
                    │  (公网访问)              │
                    └─────────────────────────┘
```

### 1.4 站点路由

| 路由 | 页面 | 说明 |
|:-----|:-----|:-----|
| `/` | 首页 | 最新日报摘要 + 往期列表 |
| `/reports/` | 历史归档 | 按年月分组的全部日报 |
| `/reports/YYYY-MM-DD/` | 日报详情 | 单篇日报完整内容 |

> ⚠️ **路由尾部斜杠**：由于使用 `trailingSlash: true`，所有 URL 必须以 `/` 结尾。

---

## 2. 环境准备

### 2.1 本地开发环境

| 工具 | 要求版本 | 验证命令 |
|:-----|:---------|:---------|
| Node.js | ≥ 22.0 | `node -v` |
| npm | ≥ 10.0 | `npm -v` |
| Git | ≥ 2.40 | `git --version` |
| GitHub CLI（可选） | ≥ 2.40 | `gh --version` |

### 2.2 账号准备

- **GitHub 账号**：用于托管代码仓库
- **Cloudflare 账号**：用于 Pages 部署（免费套餐即可）

---

## 3. 从零创建项目（完整复现）

### 3.1 初始化 Next.js 项目

```bash
# 创建项目（使用 npm，不用 pnpm）
npx create-next-app@latest energy-daily-web \
  --typescript --tailwind --eslint --app \
  --src-dir --import-alias "@/*" --use-npm --no-turbopack

cd energy-daily-web
```

### 3.2 安装依赖

```bash
# 核心依赖
npm install react-markdown lucide-react date-fns rehype-raw remark-gfm

# UI 基础依赖
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge
```

### 3.3 创建目录结构

```bash
mkdir -p src/components/ui src/lib data/reports
```

### 3.4 修改 next.config.ts

**这是最关键的配置**——必须启用静态导出和尾部斜杠：

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",        // ← 静态导出模式
  trailingSlash: true,     // ← 目录式路由（Cloudflare Pages 必需）
  images: {
    unoptimized: true,     // ← 静态导出不支持图片优化
  },
};

export default nextConfig;
```

### 3.5 创建数据层

#### `src/lib/utils.ts`

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

#### `src/lib/reports.ts`

负责从文件系统读取 `data/reports/` 下的 Markdown 日报。

核心函数：
- `getAllReports()` — 返回所有日报元数据列表（按日期降序）
- `getReportByDate(date)` — 返回指定日期的日报内容
- `getLatestReport()` — 返回最新一期日报
- `getAdjacentDates(date)` — 返回上一篇/下一篇日期

#### `src/lib/markdown.ts`

负责解析 Markdown 内容，提取结构化数据。

核心函数：
- `extractSections(markdown)` — 按 `##` 标题拆分板块
- `extractPriceTable(tableContent)` — 提取价格表格数据
- `extractWeatherData(markdown)` — 提取 10 城天气数据
- `extractPolicies(markdown)` — 提取政策列表
- `extractMarketNews(markdown)` — 提取市场动态

### 3.6 创建 UI 组件

| 组件文件 | 用途 |
|:---------|:-----|
| `src/components/ui/button.tsx` | 通用按钮（3 种变体：default/outline/ghost） |
| `src/components/ThemeToggle.tsx` | 深色/浅色模式切换（`"use client"`） |
| `src/components/Sidebar.tsx` | 侧边栏导航，按月份分组（`"use client"`） |
| `src/components/ReportHeader.tsx` | 日报报头 |
| `src/components/PriceTable.tsx` | 价格表格（↑红 ↓绿 —灰） |
| `src/components/WeatherGrid.tsx` | 10 城天气卡片网格 |
| `src/components/PolicySection.tsx` | 电力市场政策与动态 |
| `src/components/ReportNav.tsx` | 上一篇/下一篇导航（`"use client"`） |
| `src/components/ReportCard.tsx` | 日报摘要卡片 |

### 3.7 创建页面路由

#### `src/app/layout.tsx`（根布局）

```typescript
// 关键点：
// - metadata 设置标题和描述
// - Geist 字体加载
// - suppressHydrationWarning 用于深色模式兼容
```

#### `src/app/page.tsx`（首页）

读取最新日报 + 最近 9 期列表，展示为 Dashboard 卡片。

#### `src/app/reports/page.tsx`（历史归档）

按年月分组展示所有日报。

#### `src/app/reports/[date]/page.tsx`（日报详情）

> ⚠️ **关键陷阱**：Next.js 16 中 `params` 是 `Promise`，必须 `await`！

```typescript
// ✅ 正确写法（Next.js 16）
export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const report = getReportByDate(date);
  // ...
}

// ❌ 错误写法（Next.js 14/15 的旧写法，会导致 404）
export default function ReportDetailPage({
  params,
}: {
  params: { date: string };
}) {
  const { date } = params;  // 构建时渲染失败，生成 404 页面
}
```

### 3.8 创建示例日报数据

在 `data/reports/` 下放入 Markdown 日报文件，命名格式：`energy_daily_YYYY-MM-DD.md`

文件格式遵循日报模板 v2.0（见技术方案文档 §7.2）。

### 3.9 验证本地构建

```bash
# 构建
npm run build

# 检查输出
ls out/index.html                    # 首页
ls out/reports/index.html            # 历史归档
ls out/reports/2026-06-20/index.html # 日报详情

# 验证内容（不能是 404 页面）
grep -c "原油" out/reports/2026-06-20/index.html  # 应返回 > 0
grep -c "could not be found" out/reports/2026-06-20/index.html  # 应返回 0
```

---

## 4. 关键配置文件说明

### 4.1 `next.config.ts`

| 配置项 | 值 | 原因 |
|:-------|:---|:-----|
| `output` | `"export"` | 生成纯静态 HTML，Cloudflare Pages 直接托管 |
| `trailingSlash` | `true` | 生成目录式路由（`/reports/2026-06-20/index.html`），避免 Cloudflare 的 `.html` 扩展名问题 |
| `images.unoptimized` | `true` | 静态导出不支持 Next.js Image Optimization |

### 4.2 `tsconfig.json`

路径别名 `@/*` 映射到 `./src/*`，所有 import 使用 `@/lib/xxx`、`@/components/xxx`。

### 4.3 `postcss.config.mjs`

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

> Tailwind CSS v4 不再需要 `tailwind.config.js`，配置通过 CSS `@theme` 指令完成（见 `src/app/globals.css`）。

### 4.4 `src/app/globals.css`

使用 Tailwind v4 的 `@import "tailwindcss"` + `@theme inline` 语法定义主题变量，包含浅色/深色双模式。

### 4.5 `.gitignore`

确保以下条目存在：
```
/node_modules
/.next
/out
.env*
.vercel
*.tsbuildinfo
next-env.d.ts
```

---

## 5. 部署到 Cloudflare Pages

### 5.1 推送代码到 GitHub

```bash
cd energy-daily-web
git init
git config user.email "your@email.com"
git config user.name "Your Name"
git branch -m main
git add -A
git commit -m "feat: init energy daily report web dashboard"

# 创建 GitHub 仓库并推送
gh repo create energy-daily-web --public --push --source . --remote origin
```

### 5.2 在 Cloudflare 创建 Pages 项目

> ⚠️ **重要**：必须创建 **Pages** 项目，不是 **Workers** 项目。Workers 会触发 OpenNext 适配器，与 Next.js 16 App Router 不兼容。

**操作路径**：

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 左侧菜单 → **Workers & Pages**
3. 点击 **Create application**
4. 页面底部找到 **"Looking to deploy Pages? Get started"** → 点击 **Get started**
5. 选择 **"Import an existing Git repository"** → **Get started**
6. 授权 GitHub，选择 `energy-daily-web` 仓库
7. 点击 **Begin setup**

**构建设置**：

| 字段 | 填写内容 |
|:-----|:---------|
| Project name | `energy-daily-web` |
| Production branch | `main` |
| Framework preset | **Next.js** |
| Build command | `npm run build` |
| Build output directory | `out` |

8. 点击 **Save and Deploy**
9. 等待 1-2 分钟构建完成

### 5.3 验证部署

部署成功后，Cloudflare 会分配域名：`https://energy-daily-web.pages.dev`

验证步骤：
```bash
# 检查首页
curl -s -o /dev/null -w "%{http_code}" https://energy-daily-web.pages.dev/
# 期望：200

# 检查日报详情页（注意尾部斜杠）
curl -s -o /dev/null -w "%{http_code}" https://energy-daily-web.pages.dev/reports/2026-06-20/
# 期望：200

# 检查内容是否正常（非 404）
curl -s https://energy-daily-web.pages.dev/reports/2026-06-20/ | grep -c "原油"
# 期望：> 0

curl -s https://energy-daily-web.pages.dev/reports/2026-06-20/ | grep -c "could not be found"
# 期望：0
```

### 5.4 访问控制（可选）

Cloudflare Pages 免费版不支持密码保护。如需限制访问：

1. **Cloudflare Zero Trust**（免费 50 用户）：Dashboard → Zero Trust → Access → 添加应用，设置邮箱验证
2. **IP 白名单**：Dashboard → Security → WAF → 添加 IP 规则

---

## 6. 每日自动更新流程

### 6.1 同步脚本

**文件路径**：`/workspace/scripts/update_web_data.py`

**用法**：
```bash
python3 /workspace/scripts/update_web_data.py --date 2026-06-20
```

**执行流程**：

```
1. 查找源文件（workspace/能源日报/ 或 workspace/memory/）
2. 复制到 energy-daily-web/data/reports/
3. 更新 reports.json 索引
4. git add → git commit → git push
5. Cloudflare 检测到 push → 自动重新部署
6. 记录交付状态到 memory/daily_report_delivered.json
```

**参数**：

| 参数 | 说明 |
|:-----|:-----|
| `--date YYYY-MM-DD` | 必填，日报日期 |
| `--no-push` | 可选，仅复制文件不推送（调试用） |

### 6.2 集成到日报生成流程

在日报双交付完成后，追加执行同步脚本：

```bash
# 日报生成完成后
python3 /workspace/scripts/update_web_data.py --date $(date +%F)
```

### 6.3 手动添加新日报

如需手动添加一篇日报：

```bash
# 1. 将 Markdown 文件放入数据目录
cp /path/to/energy_daily_2026-06-21.md /workspace/energy-daily-web/data/reports/

# 2. 提交并推送
cd /workspace/energy-daily-web
git add -A
git commit -m "[日报] 2026-06-21 同步"
git push origin main

# 3. 等待 Cloudflare 自动部署（1-2 分钟）
```

---

## 7. 踩坑记录与故障排查

### 7.1 踩坑时间线

本次部署过程中遇到的所有问题及解决方案，按时间顺序记录：

| # | 问题 | 根因 | 解决方案 |
|---|------|------|---------|
| 1 | Vercel 账号被风控 | IP/地区风控 | 切换到 Cloudflare Pages |
| 2 | `pnpm install` 失败：`packages field missing` | `pnpm-workspace.yaml` 残留 | 删除 `pnpm-workspace.yaml` 和 `pnpm-lock.yaml`，改用 npm |
| 3 | Cloudflare 检测到 pnpm 但仓库已切换 npm | Cloudflare 缓存了旧 commit | 推送空 commit 强制触发重新部署 |
| 4 | OpenNext 构建失败：`ENOENT pages-manifest.json` | 误创建为 Workers 项目，触发了不兼容的 OpenNext 适配器 | 删除 Workers 项目，在 Pages 下重新创建 |
| 5 | 日报详情页 404：`NEXT_HTTP_ERROR_FALLBACK;404` | Next.js 16 中 `params` 是 `Promise`，未 `await` | 改为 `async function` + `await params` |
| 6 | 路由跳转白屏（无尾部斜杠） | Cloudflare Pages 无法自动匹配 `.html` 文件 | `trailingSlash: true` 生成目录式路由 |

### 7.2 故障排查指南

#### 问题：首页正常，日报详情页白屏/404

**检查步骤**：

```bash
# 1. 检查本地构建输出是否正常
npm run build
grep -c "could not be found" out/reports/2026-06-20/index.html
# 如果返回 1，说明构建时就失败了

# 2. 检查 params 是否正确 await
grep "params" src/app/reports/\[date\]/page.tsx
# 应该看到 Promise<{ date: string }> 和 await params

# 3. 检查 trailingSlash 配置
cat next.config.ts
# 应该包含 trailingSlash: true
```

#### 问题：Cloudflare 构建失败

**检查步骤**：

```bash
# 1. 确认使用 npm 而非 pnpm
ls package-lock.json   # 应存在
ls pnpm-lock.yaml      # 应不存在
ls pnpm-workspace.yaml # 应不存在

# 2. 确认构建命令
# Cloudflare Build command 应为：npm run build
# Cloudflare Build output 应为：out

# 3. 确认是 Pages 项目不是 Workers
# Workers 会显示 "Deploy command: npx wrangler deploy"
# Pages 不需要 Deploy command
```

#### 问题：Cloudflare 缓存旧代码

```bash
# 推送空 commit 强制触发部署
cd energy-daily-web
git commit --allow-empty -m "chore: trigger fresh deployment"
git push origin main
```

#### 问题：`NODE_OPTIONS` 环境变量冲突

某些沙箱环境会注入 `NODE_OPTIONS` 导致 Node.js 报错：

```
Error: Cannot find module '/$bunfs/root/vendor/shim/genie-safe-delete.cjs'
```

**解决**：运行命令时清除环境变量：

```bash
env -u NODE_OPTIONS npm run build
# 或
NODE_OPTIONS="" npm run build
```

---

## 8. 文件清单

### 8.1 项目文件

```
energy-daily-web/
├── data/
│   └── reports/
│       └── energy_daily_2026-06-20.md      # 示例日报数据
├── public/
│   ├── favicon.ico
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   └── window.svg
├── src/
│   ├── app/
│   │   ├── globals.css                     # 全局样式（Tailwind v4 主题）
│   │   ├── layout.tsx                      # 根布局
│   │   ├── page.tsx                        # 首页
│   │   ├── favicon.ico
│   │   └── reports/
│   │       ├── page.tsx                    # 历史归档页
│   │       └── [date]/
│   │           └── page.tsx                # 日报详情页
│   ├── components/
│   │   ├── ui/
│   │   │   └── button.tsx                  # 通用按钮
│   │   ├── PolicySection.tsx               # 政策区块
│   │   ├── PriceTable.tsx                  # 价格表格
│   │   ├── ReportCard.tsx                  # 日报卡片
│   │   ├── ReportHeader.tsx                # 报头
│   │   ├── ReportNav.tsx                   # 上下篇导航
│   │   ├── Sidebar.tsx                     # 侧边栏
│   │   ├── ThemeToggle.tsx                 # 深色模式
│   │   └── WeatherGrid.tsx                 # 天气网格
│   └── lib/
│       ├── markdown.ts                     # Markdown 解析
│       ├── reports.ts                      # 数据加载
│       └── utils.ts                        # 工具函数
├── .gitignore
├── eslint.config.mjs
├── next.config.ts                          # ★ 关键配置
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── tsconfig.json
└── README.md
```

### 8.2 同步脚本

```
/workspace/scripts/
└── update_web_data.py                      # 日报同步脚本
```

### 8.3 代码统计

| 模块 | 文件数 | 总行数 |
|:-----|:-------|:-------|
| `src/lib/` | 3 | 375 |
| `src/components/` | 9 | 825 |
| `src/app/` | 5 | 905 |
| **合计** | **17** | **~2,105** |

### 8.4 外部资源

| 资源 | 地址 |
|:-----|:-----|
| GitHub 仓库 | https://github.com/shandyshanq-gif/energy-daily-web |
| 线上站点 | https://energy-daily-web.pages.dev |
| Cloudflare Dashboard | https://dash.cloudflare.com |
| 技术方案 v2.0 | 项目网盘 `技术方案文档/技术方案-v2.0.md` |

---

## 附录 A：完整从零部署速查

```bash
# 1. 创建项目
npx create-next-app@latest energy-daily-web \
  --typescript --tailwind --eslint --app \
  --src-dir --import-alias "@/*" --use-npm --no-turbopack
cd energy-daily-web

# 2. 安装依赖
npm install react-markdown lucide-react date-fns rehype-raw remark-gfm
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge

# 3. 创建目录
mkdir -p src/components/ui src/lib data/reports

# 4. 编写代码（参考 §3 和 §8 的文件清单）

# 5. 修改 next.config.ts（参考 §4.1）

# 6. 本地验证
npm run build
grep -c "could not be found" out/reports/2026-06-20/index.html  # 应为 0

# 7. 推送 GitHub
git init && git branch -m main
git add -A && git commit -m "feat: init"
gh repo create energy-daily-web --public --push --source . --remote origin

# 8. Cloudflare Pages 部署（参考 §5.2）
# Framework preset: Next.js
# Build command: npm run build
# Build output: out

# 9. 验证线上
curl -s -o /dev/null -w "%{http_code}" https://energy-daily-web.pages.dev/
# 期望: 200
```

---

## 附录 B：日报 Markdown 格式要求

网页解析器依赖以下格式约定：

| 板块 | 标题格式 | 解析方式 |
|:-----|:---------|:---------|
| 原油 | `## 🛢️ 原油` | 提取 Markdown 表格 → PriceTable 组件 |
| 天然气 | `## 🔥 天然气 / LNG` | 提取表格 + 文本 |
| 煤炭 | `## ⛏️ 煤炭` | 提取表格 |
| 电力市场 | `## ⚡ 电力市场` | 提取 `### 🏛️ 政策` 和 `### 📰 市场` 下的编号列表 |
| 天气 | `## 🌤️ 核心负荷区天气` | 提取表格 → WeatherGrid 组件 |
| 关键数据 | `## 📊 关键数据一览` | 提取表格 |
| 联动分析 | `## 🔗 四品种联动` | 提取编号列表 |

**政策/市场动态条目格式**（必须严格遵守）：

```markdown
1. **标题文字** — 摘要内容。[来源名称](https://来源链接)
```

正则匹配模式：`/\d+\.\s+\*\*(.+?)\*\*\s*[—–-]+\s*(.+?)\s*\[([^\]]+)\]\(([^)]+)\)/`
