# -*- coding: utf-8 -*-
"""检查 cxcyxy 列表翻页格式"""
import re
h = open('tools/debug_list.html', encoding='utf-8', errors='ignore').read()
pages = re.findall(r'href=["\']([^"\']*list[^"\']*)["\']', h)
print('pagination links:', sorted(set(pages)))
# 也找 js 翻页
ps = re.findall(r'list\.htm\?[^"\']*', h)
print('query pagination:', sorted(set(ps))[:6])
total = re.search(r'共(\d+)', h)
print('total marker:', total.group(0) if total else None)
