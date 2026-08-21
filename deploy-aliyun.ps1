﻿# 日报 Web 部署到阿里云一键脚本
# 用法：powershell -ExecutionPolicy Bypass -File deploy-aliyun.ps1

$ErrorActionPreference = "Stop"
$PROJECT_DIR = if ($PSScriptRoot) { $PSScriptRoot } elseif ($PSCommandPath) { Split-Path -Parent $PSCommandPath } else { Split-Path -Parent $MyInvocation.My.Command.Path }
$SERVER = "admin@39.108.131.221"
$REMOTE_DIR = "/var/www/energy-daily-web/out"

Write-Host "===== 日报 Web 部署开始 =====" -ForegroundColor Cyan
$startTime = Get-Date

# 0. 同步最新日报 Markdown 到 web 目录（构建前必须执行）
$REPO_ROOT = Split-Path -Parent $PROJECT_DIR
$REPORTS_SRC = Join-Path $REPO_ROOT "能源日报"
$REPORTS_DST = Join-Path $PROJECT_DIR "data\reports"
if (Test-Path $REPORTS_SRC) {
    if (-not (Test-Path $REPORTS_DST)) {
        New-Item -ItemType Directory -Path $REPORTS_DST -Force | Out-Null
    }
    $copied = 0
    Get-ChildItem -Path $REPORTS_SRC -Filter "energy_daily_*.md" | ForEach-Object {
        $dstFile = Join-Path $REPORTS_DST $_.Name
        Copy-Item -Path $_.FullName -Destination $dstFile -Force
        $copied++
    }
    Write-Host "已同步 $copied 篇日报到 web 目录" -ForegroundColor DarkGray
} else {
    Write-Host "警告：日报源目录不存在 ($REPORTS_SRC)，跳过同步" -ForegroundColor Yellow
}

# 1. 本地构建（清除 .next 缓存避免旧数据残留）
Write-Host "[1/5] 清除 .next 缓存 + 本地构建..." -ForegroundColor Yellow
Set-Location $PROJECT_DIR
if (Test-Path "$PROJECT_DIR\.next") {
    Remove-Item -Recurse -Force "$PROJECT_DIR\.next"
    Write-Host ".next 缓存已清除" -ForegroundColor DarkGray
}
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "构建失败" -ForegroundColor Red
    exit 1
}
Write-Host "构建完成" -ForegroundColor Green

# 2. 打包并上传到服务器（tar 方式保留目录结构）
#    注意：不能用 scp -r out/*，PowerShell 下通配符展开会把子目录路径变成反斜杠扁平文件名
Write-Host "[2/5] 打包并上传到服务器（tar 方式保留目录结构）..." -ForegroundColor Yellow
$tarFile = Join-Path $PROJECT_DIR "out-deploy.tar.gz"
tar -czf $tarFile -C "$PROJECT_DIR\out" .
if ($LASTEXITCODE -ne 0) {
    Write-Host "打包失败" -ForegroundColor Red
    exit 1
}
scp -o ConnectTimeout=10 $tarFile "${SERVER}:/tmp/out-deploy.tar.gz"
if ($LASTEXITCODE -ne 0) {
    Write-Host "上传失败" -ForegroundColor Red
    exit 1
}
ssh -o ConnectTimeout=10 $SERVER "rm -rf $REMOTE_DIR/* && cd $REMOTE_DIR && tar -xzf /tmp/out-deploy.tar.gz && rm -f /tmp/out-deploy.tar.gz"
if ($LASTEXITCODE -ne 0) {
    Write-Host "服务器解压失败" -ForegroundColor Red
    exit 1
}
Remove-Item -Force $tarFile
Write-Host "上传完成" -ForegroundColor Green

# 3. 修复文件权限（Nginx 需要可读权限）
Write-Host "[3/5] 修复文件权限..." -ForegroundColor Yellow
ssh -o ConnectTimeout=10 $SERVER "sudo chmod -R 755 $REMOTE_DIR"
Write-Host "权限已修复" -ForegroundColor Green

# 4. 验证
Write-Host "[4/5] 验证网站..." -ForegroundColor Yellow
Write-Host "  首页: " -NoNewline
$status = ssh -o ConnectTimeout=10 $SERVER "curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/"
Write-Host $status -ForegroundColor $(if ($status -eq "200") {"Green"} else {"Yellow"})
Write-Host "  CSS:  " -NoNewline
$cssCheckCmd = 'cssPath=$(grep -oP ''(?<=href=")[^"]*\.css'' /var/www/energy-daily-web/out/index.html | head -1); curl -s -o /dev/null -w ''%{http_code}'' "http://localhost:8080$cssPath"'
$cssStatus = ssh -o ConnectTimeout=10 $SERVER $cssCheckCmd
Write-Host $cssStatus -ForegroundColor $(if ($cssStatus -eq "200") {"Green"} else {"Yellow"})

# 5. 清理
Write-Host "[5/5] 清理临时文件..." -ForegroundColor DarkGray

$elapsed = ((Get-Date) - $startTime).TotalSeconds
Write-Host ""
Write-Host "===== 部署完成！耗时 $([math]::Round($elapsed, 1)) 秒 =====" -ForegroundColor Cyan
Write-Host "访问地址: http://39.108.131.221:8080" -ForegroundColor Cyan
