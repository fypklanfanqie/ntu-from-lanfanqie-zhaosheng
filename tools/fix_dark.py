#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""批量处理综测帮页面：移除内联暗色脚本，统一引入 theme.js"""
import re

pages = ['zongce/index.html', 'zongce/calculator.html',
         'zongce/tracker.html', 'zongce/other.html']

inline_pat = re.compile(
    r'\n?\s*<script>\s*\n\s*\(function\(\)\{\s*'
    r'var dm = document\.querySelector\(\'\.dark-mode-toggle\'\);.*?'
    r'\}\)\(\);\s*\n\s*</script>', re.S)

for p in pages:
    html = open(p, encoding='utf-8').read()
    m = inline_pat.search(html)
    if m:
        html = html[:m.start()] + html[m.end():]
        print(p, ': removed inline dark script')
    else:
        print(p, ': inline script not found (check manually)')
    # 确保 theme.js 引入（放在 main.js 之前）
    if 'js/theme.js' not in html:
        html = html.replace('<script src="../js/main.js"></script>',
                            '<script src="../js/theme.js"></script>\n  <script src="../js/main.js"></script>')
        print(p, ': theme.js injected')
    open(p, 'w', encoding='utf-8').write(html)
print('done')
