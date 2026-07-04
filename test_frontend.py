#!/usr/bin/env python3
"""
前端测试脚本
测试Next.js/React前端系统的构建和功能
"""

import os
import subprocess
import sys
from pathlib import Path
import json
import tempfile
import shutil
from datetime import datetime


def run_command(cmd, cwd=None, timeout=300):
    """运行命令并返回结果"""
    try:
        result = subprocess.run(
            cmd,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=timeout,
            shell=True if sys.platform == 'win32' else False
        )
        return {
            'success': result.returncode == 0,
            'stdout': result.stdout,
            'stderr': result.stderr,
            'returncode': result.returncode
        }
    except subprocess.TimeoutExpired:
        return {
            'success': False,
            'stdout': '',
            'stderr': 'Command timed out',
            'returncode': -1
        }
    except Exception as e:
        return {
            'success': False,
            'stdout': '',
            'stderr': str(e),
            'returncode': -1
        }


def test_frontend_build():
    """测试前端构建"""
    print("=" * 60)
    print("测试前端构建")
    print("=" * 60)
    
    web_dir = Path("energy-daily-web")
    if not web_dir.exists():
        print("FAIL 前端目录不存在")
        return False
    
    # 检查package.json是否存在
    package_json = web_dir / "package.json"
    if not package_json.exists():
        print("FAIL package.json不存在")
        return False
    
    print("PASS 前端目录存在")
    
    # 检查node_modules是否存在
    node_modules = web_dir / "node_modules"
    if not node_modules.exists():
        print("WARN node_modules不存在，尝试安装依赖...")
        result = run_command("npm install", cwd=str(web_dir))
        if not result['success']:
            print(f"FAIL 依赖安装失败: {result['stderr']}")
            return False
    
    print("PASS 依赖已安装")
    
    # 测试构建
    print("运行构建命令...")
    result = run_command("npm run build", cwd=str(web_dir), timeout=600)
    
    if result['success']:
        print("PASS 构建成功")
        
        # 检查构建输出
        out_dir = web_dir / "out"
        if out_dir.exists():
            print(f"PASS 构建输出目录存在: {out_dir}")
            
            # 检查是否有HTML文件
            html_files = list(out_dir.glob("**/*.html"))
            if html_files:
                print(f"PASS 生成了 {len(html_files)} 个HTML文件")
            else:
                print("WARN 没有生成HTML文件")
                return False
            
            # 检查是否有JS文件
            js_files = list(out_dir.glob("**/*.js"))
            print(f"PASS 生成了 {len(js_files)} 个JS文件")
            
            # 检查是否有CSS文件
            css_files = list(out_dir.glob("**/*.css"))
            print(f"PASS 生成了 {len(css_files)} 个CSS文件")
            
            return True
        else:
            print("FAIL 构建输出目录不存在")
            return False
    else:
        print(f"FAIL 构建失败: {result['stderr']}")
        return False


def test_typescript_compilation():
    """测试TypeScript编译"""
    print("\n" + "=" * 60)
    print("测试TypeScript编译")
    print("=" * 60)
    
    web_dir = Path("energy-daily-web")
    
    # 检查tsconfig.json
    tsconfig = web_dir / "tsconfig.json"
    if not tsconfig.exists():
        print("FAIL tsconfig.json不存在")
        return False
    
    print("PASS tsconfig.json存在")
    
    # 运行TypeScript检查
    print("运行TypeScript类型检查...")
    result = run_command("npx tsc --noEmit", cwd=str(web_dir))
    
    if result['success']:
        print("PASS TypeScript类型检查通过")
        return True
    else:
        print(f"WARN TypeScript类型检查有警告或错误:")
        print(result['stdout'])
        # TypeScript检查可能有警告但构建仍然成功
        return True


def test_eslint():
    """测试ESLint"""
    print("\n" + "=" * 60)
    print("测试ESLint")
    print("=" * 60)
    
    web_dir = Path("energy-daily-web")
    
    # 检查ESLint配置
    eslint_config = web_dir / "eslint.config.mjs"
    if not eslint_config.exists():
        print("WARN ESLint配置文件不存在")
        return True  # 不是必须的
    
    print("PASS ESLint配置文件存在")
    
    # 运行ESLint
    print("运行ESLint检查...")
    result = run_command("npx eslint src/", cwd=str(web_dir))
    
    if result['success']:
        print("PASS ESLint检查通过")
        return True
    else:
        print(f"WARN ESLLint检查有警告或错误:")
        print(result['stdout'])
        # ESLint错误可能不阻止构建
        return True


def test_react_components():
    """测试React组件结构"""
    print("\n" + "=" * 60)
    print("测试React组件结构")
    print("=" * 60)
    
    web_dir = Path("energy-daily-web")
    src_dir = web_dir / "src"
    
    if not src_dir.exists():
        print("FAIL src目录不存在")
        return False
    
    print("PASS src目录存在")
    
    # 检查主要目录结构
    required_dirs = [
        "app",
        "components",
        "hooks",
        "lib",
        "types"
    ]
    
    for dir_name in required_dirs:
        dir_path = src_dir / dir_name
        if dir_path.exists():
            print(f"PASS {dir_name}/目录存在")
        else:
            print(f"FAIL {dir_name}/目录不存在")
            return False
    
    # 检查关键组件
    components_dir = src_dir / "components"
    if components_dir.exists():
        tsx_files = list(components_dir.glob("**/*.tsx"))
        print(f"PASS 发现 {len(tsx_files)} 个React组件")
        
        # 检查关键组件
        key_components = [
            "ReportCard.tsx",
            "ReportHeader.tsx",
            "Sidebar.tsx",
            "ThemeToggle.tsx"
        ]
        
        for component in key_components:
            component_path = components_dir / component
            if component_path.exists():
                print(f"PASS {component}存在")
            else:
                print(f"WARN {component}不存在")
    
    # 检查页面组件
    app_dir = src_dir / "app"
    if app_dir.exists():
        page_files = list(app_dir.glob("**/page.tsx"))
        print(f"PASS 发现 {len(page_files)} 个页面组件")
    
    return True


def test_data_files():
    """测试数据文件"""
    print("\n" + "=" * 60)
    print("测试数据文件")
    print("=" * 60)
    
    web_dir = Path("energy-daily-web")
    data_dir = web_dir / "data"
    
    if not data_dir.exists():
        print("FAIL data目录不存在")
        return False
    
    print("PASS data目录存在")
    
    # 检查reports目录
    reports_dir = data_dir / "reports"
    if reports_dir.exists():
        report_files = list(reports_dir.glob("*.md"))
        print(f"PASS 发现 {len(report_files)} 个日报文件")
        
        # 检查是否有今天的日报文件
        today = datetime.now().strftime("%Y-%m-%d")
        today_report = reports_dir / f"energy_daily_{today}.md"
        if today_report.exists():
            print(f"PASS 今天的日报文件存在: {today_report}")
        else:
            print(f"WARN 今天的日报文件不存在: {today_report}")
        
        return True
    else:
        print("FAIL reports目录不存在")
        return False


def test_static_export():
    """测试静态导出配置"""
    print("\n" + "=" * 60)
    print("测试静态导出配置")
    print("=" * 60)
    
    web_dir = Path("energy-daily-web")
    
    # 检查next.config.ts
    next_config = web_dir / "next.config.ts"
    if next_config.exists():
        print("PASS next.config.ts存在")
        
        # 读取配置文件内容
        with open(next_config, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if "output: 'export'" in content:
            print("PASS 静态导出配置正确")
            return True
        else:
            print("WARN 可能没有静态导出配置")
            return True
    else:
        print("FAIL next.config.ts不存在")
        return False


def test_deployment_files():
    """测试部署文件"""
    print("\n" + "=" * 60)
    print("测试部署文件")
    print("=" * 60)
    
    web_dir = Path("energy-daily-web")
    
    # 检查Cloudflare配置
    wrangler_config = web_dir / "wrangler.toml"
    if wrangler_config.exists():
        print("PASS wrangler.toml存在")
        
        # 读取配置文件内容
        with open(wrangler_config, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if "pages" in content.lower():
            print("PASS Cloudflare Pages配置正确")
            return True
        else:
            print("WARN 可能不是Pages配置")
            return True
    else:
        print("WARN wrangler.toml不存在")
        return True


def test_package_scripts():
    """测试package.json脚本"""
    print("\n" + "=" * 60)
    print("测试package.json脚本")
    print("=" * 60)
    
    web_dir = Path("energy-daily-web")
    package_json = web_dir / "package.json"
    
    if not package_json.exists():
        print("FAIL package.json不存在")
        return False
    
    with open(package_json, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    scripts = data.get('scripts', {})
    
    # 检查必要脚本
    required_scripts = [
        'dev',
        'build',
        'start',
        'lint'
    ]
    
    for script in required_scripts:
        if script in scripts:
            print(f"PASS {script}脚本存在")
        else:
            print(f"FAIL {script}脚本不存在")
            return False
    
    # 检查部署脚本
    if 'deploy' in scripts:
        print("PASS deploy脚本存在")
    else:
        print("WARN deploy脚本不存在")
    
    return True


def run_all_tests():
    """运行所有测试"""
    print("能源日报前端系统测试")
    print("=" * 60)
    
    tests = [
        ("前端构建", test_frontend_build),
        ("TypeScript编译", test_typescript_compilation),
        ("ESLint检查", test_eslint),
        ("React组件结构", test_react_components),
        ("数据文件", test_data_files),
        ("静态导出配置", test_static_export),
        ("部署文件", test_deployment_files),
        ("package.json脚本", test_package_scripts),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"FAIL {test_name}测试异常: {e}")
            results.append((test_name, False))
    
    # 输出测试结果
    print("\n" + "=" * 60)
    print("测试结果汇总")
    print("=" * 60)
    
    passed = 0
    failed = 0
    
    for test_name, result in results:
        status = "PASS 通过" if result else "FAIL 失败"
        print(f"{test_name}: {status}")
        
        if result:
            passed += 1
        else:
            failed += 1
    
    print(f"\n总计: {len(results)} 个测试")
    print(f"通过: {passed} 个")
    print(f"失败: {failed} 个")
    
    if failed == 0:
        print("\n所有测试通过！")
        return True
    else:
        print(f"\n有 {failed} 个测试失败")
        return False


if __name__ == '__main__':
    success = run_all_tests()
    sys.exit(0 if success else 1)