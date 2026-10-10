# -*- coding: utf-8 -*-
import re
h = open('tools/debug_list.html', encoding='utf-8', errors='ignore').read()
print('len:', len(h))
links = re.findall(r'<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>', h, re.S)
print('total links:', len(links))
shown = 0
for u, t in links:
    t = re.sub(r'<[^>]+>', '', t).strip()
    if t and not t.startswith('http') and shown < 25:
        print(repr(u[:60]), '|', t[:52])
        shown += 1
