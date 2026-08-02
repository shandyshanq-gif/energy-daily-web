"""外链全量巡检脚本 — 提取所有 Markdown 链接并检查合法性"""
import os
import re
import json

LINK_RE = re.compile(r'\[([^\]]+)\]\(([^)]+)\)')
REPORTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'reports')

def check_links():
    issues = []
    total_links = 0
    valid_links = 0
    
    if not os.path.exists(REPORTS_DIR):
        print(f'Reports directory not found: {REPORTS_DIR}')
        return
    
    for f in sorted(os.listdir(REPORTS_DIR)):
        if not f.endswith('.md'):
            continue
        
        filepath = os.path.join(REPORTS_DIR, f)
        with open(filepath, 'r', encoding='utf-8', errors='replace') as fh:
            content = fh.read()
        
        for m in LINK_RE.finditer(content):
            total_links += 1
            text = m.group(1)
            url = m.group(2).strip()
            
            # 检查 URL 合法性
            if not url.startswith(('http://', 'https://')):
                issues.append({
                    'file': f,
                    'text': text,
                    'url': url,
                    'issue': '非 http/https 链接',
                    'suggestion': '需补充完整 URL 或以纯文本展示'
                })
                continue
            
            if ' ' in url:
                issues.append({
                    'file': f,
                    'text': text,
                    'url': url,
                    'issue': 'URL 含空格，可能被截断',
                    'suggestion': '需对 URL 中的空格进行编码或移除'
                })
                continue
            
            if '代码' in url.lower() or 'code' in url.lower() or 'github' in url.lower() and 'issue' in url.lower():
                issues.append({
                    'file': f,
                    'text': text,
                    'url': url,
                    'issue': '可能指向代码页面而非官方页面',
                    'suggestion': '需确认是否指向正确的官方页面'
                })
                continue
            
            valid_links += 1
    
    print(f'巡检完成:')
    print(f'  总链接数: {total_links}')
    print(f'  有效链接: {valid_links}')
    print(f'  异常链接: {len(issues)}')
    
    if issues:
        print(f'\n异常链接清单:')
        for iss in issues:
            print(f'  [{iss["file"]}] "{iss["text"]}" → {iss["url"]}')
            print(f'    问题: {iss["issue"]}')
            print(f'    建议: {iss["suggestion"]}')
        
        # 输出 JSON 报告
        report_path = os.path.join(os.path.dirname(REPORTS_DIR), 'link_issues.json')
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(issues, f, ensure_ascii=False, indent=2)
        print(f'\n异常报告已保存: {report_path}')
    else:
        print('\n✅ 所有链接均正常!')

if __name__ == '__main__':
    check_links()