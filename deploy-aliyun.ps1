# 日报 Web 部署到阿里云一键脚本
# 用法：powershell -ExecutionPolicy Bypass -File deploy-aliyun.ps1

$ErrorActionPreference = "Stop"
$PROJECT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$SERVER = "admin@39.108.131.221"
$REMOTE_DIR = "/var/www/energy-daily-web/out"

Write-Host "===== 日报 Web 部署开始 =====" -ForegroundColor Cyan
$startTime = Get-Date

# 1. 本地构建
Write-Host "[1/4] 本地构建..." -ForegroundColor Yellow
Set-Location $PROJECT_DIR
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "构建失败" -ForegroundColor Red
    exit 1
}
Write-Host "构建完成" -ForegroundColor Green

# 2. 上传到服务器
Write-Host "[2/4] 上传到服务器..." -ForegroundColor Yellow
scp -r -o ConnectTimeout=10 "$PROJECT_DIR\out\*" "${SERVER}:$REMOTE_DIR/"
if ($LASTEXITCODE -ne 0) {
    Write-Host "上传失败" -ForegroundColor Red
    exit 1
}
Write-Host "上传完成" -ForegroundColor Green

# 3. 修复文件权限（Nginx 需要可读权限）
Write-Host "[3/4] 修复文件权限..." -ForegroundColor Yellow
ssh -o ConnectTimeout=10 $SERVER "sudo chmod -R 755 $REMOTE_DIR"
Write-Host "权限已修复" -ForegroundColor Green

# 4. 验证
Write-Host "[4/4] 验证网站..." -ForegroundColor Yellow
$status = ssh -o ConnectTimeout=10 $SERVER "curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/"
if ($status -eq "200") {
    Write-Host "网站正常 (HTTP 200)" -ForegroundColor Green
} else {
    Write-Host "网站返回状态码: $status" -ForegroundColor Yellow
}

$elapsed = ((Get-Date) - $startTime).TotalSeconds
Write-Host ""
Write-Host "===== 部署完成！耗时 $([math]::Round($elapsed, 1)) 秒 =====" -ForegroundColor Cyan
Write-Host "访问地址: http://39.108.131.221:8080" -ForegroundColor Cyan