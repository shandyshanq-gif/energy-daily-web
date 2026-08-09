# 能源日报网页化部署文档

> **版本**：v2.0 | **日期**：2026-08-09 | **仓库**：[shandyshanq-gif/energy-daily-web](https://github.com/shandyshanq-gif/energy-daily-web)
>
> **线上地址**：http://39.108.131.221:8080

---

## 1. 项目概述

- **技术栈**：Next.js 16 + React 19 + TypeScript + Tailwind CSS v4
- **部署方式**：本地构建 + scp 直传阿里云服务器（Nginx 托管静态文件）
- **数据来源**：`data/reports/` 目录下的日报 Markdown 文件

## 2. 服务器信息

| 项目 | 值 |
|------|-----|
| IP | 39.108.131.221 |
| SSH 用户 | admin（免密已配置） |
| 系统 | Ubuntu 22.04, 2 vCPU / 2 GiB / 40 GiB ESSD |
| Web 端口 | 8080（Nginx） |
| 网站目录 | /var/www/energy-daily-web/ |
| 静态文件目录 | /var/www/energy-daily-web/out/ |
| Nginx 配置 | /etc/nginx/sites-available/energy-daily |

## 3. 部署方式

### 一键脚本部署

```powershell
powershell -ExecutionPolicy Bypass -File deploy-aliyun.ps1
```

脚本自动完成：本地构建 -> scp 上传 -> 修复权限 -> 验证网站

### 手动部署

```powershell
# 1. 本地构建
npm run build

# 2. 上传到服务器
scp -r out/* admin@39.108.131.221:/var/www/energy-daily-web/out/

# 3. 修复文件权限（Nginx 需要可读）
ssh admin@39.108.131.221 "sudo chmod -R 755 /var/www/energy-daily-web/out/"
```

## 4. Nginx 配置

```nginx
server {
    listen 8080;
    server_name _;
    root /var/www/energy-daily-web/out;
    index index.html;

    location / {
        try_files $uri $uri/ $uri.html =404;
    }

    location /_next/ {
        try_files $uri =404;
    }
}
```

## 5. 每日更新流程

1. 本地 Python 生成日报
2. 复制日报到 `energy-daily-web/data/reports/`
3. 运行 `deploy-aliyun.ps1` 或让 agent 说"部署日报"
4. 脚本自动构建 + 上传 + 上线

## 6. 故障排查

| 问题 | 原因 | 解决 |
|------|------|------|
| 页面无样式 | 文件权限不对 | `sudo chmod -R 755 /var/www/energy-daily-web/out/` |
| 404 | Nginx 配置错误 | 检查 `try_files` 配置 |
| SSH 连接失败 | 密钥未配置 | 检查 `~/.ssh/id_ed25519` 和服务器 `~/.ssh/authorized_keys` |
| 构建失败 | Node.js 版本 | 需要 Node.js 18+ |

## 7. 文件清单

| 文件 | 用途 |
|------|------|
| deploy-aliyun.ps1 | 一键部署脚本 |
| DEPLOYMENT.md | 本文档 |
| next.config.ts | Next.js 配置（静态导出） |
| package.json | 依赖管理 |
| scripts/generate-reports-index.js | 构建前生成日报索引 |
| src/ | 前端源码 |
| data/reports/ | 日报数据 |
| public/ | 静态资源 |