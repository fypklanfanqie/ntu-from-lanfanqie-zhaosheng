# -*- coding: utf-8 -*-
"""看通知条目的真实 HTML 结构（含日期节点）"""
import re
h = open('tools/debug_list.html', encoding='utf-8', errors='ignore').read()
# webplus 通知列表一般是 <li> ... <a href="/2026/...">标题</a> ... <span>日期</span>
# 找含 /2026/ 或 /2025/ 文章路径的 a
arts = re.findall(r'<a[^>]+href="(/20\d\d/[^"]+)"[^>]*>(.*?)</a>', h, re.S)
print('article links:', len(arts))
for u, t in arts[:10]:
    t = re.sub(r'<[^>]+>', '', t).strip()
    print(u[:46], '|', t[:56])
# 找日期格式
dates = re.findall(r'20\d\d[-/年]\d{1,2}[-/月]\d{1,2}', h)
print('dates found:', len(dates), dates[:5])
# 打印一个 <li> 样本
m = re.search(r'<li[^>]*>\s*<a[^>]+href="/20\d\d/[^"]+".*?</li>', h, re.S)
if m:
    print('\n--- li sample ---')
    print(m.group(0)[:600])
