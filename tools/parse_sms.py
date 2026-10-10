# -*- coding: utf-8 -*-
"""检查各学院首页的文章链接结构"""
import re, sys
h = open('tools/debug_sms.html', encoding='utf-8', errors='ignore').read()
print('len:', len(h))
arts = re.findall(r'<a[^>]+href=["\'](/20\d\d/[^"\']+)["\'][^>]*>(.*?)</a>', h, re.S)
print('article-style links:', len(arts))
for u, t in arts[:6]:
    print(' ', u[:44], '|', re.sub(r'<[^>]+>', '', t).strip()[:52])
# 通知/竞赛关键词的链接
comp = [a for a in arts if re.search(r'竞赛|大赛|报名', re.sub(r'<[^>]+>', '', a[1]))]
print('竞赛相关:', len(comp))
for u, t in comp[:5]:
    print(' *', u[:44], '|', re.sub(r'<[^>]+>', '', t).strip()[:52])
