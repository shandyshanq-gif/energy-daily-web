#!/bin/bash

echo "开始部署能源日报Web前端..."

# 构建项目
echo "正在构建项目..."
npm run build

# 检查构建是否成功
if [ $? -ne 0 ]; then
    echo "构建失败，部署终止"
    exit 1
fi

echo "构建成功！"

# 部署到Cloudflare Pages
echo "正在部署到Cloudflare Pages..."
wrangler pages deploy out --project-name energy-daily-web

# 检查部署是否成功
if [ $? -ne 0 ]; then
    echo "部署失败"
    exit 1
fi

echo "部署成功！"
echo "网站地址: https://energy-daily-web.pages.dev"