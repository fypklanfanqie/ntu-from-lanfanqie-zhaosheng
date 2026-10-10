#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""给所有主站 HTML 统一注入 theme.js（在 main.js 之前）"""
import glob, re, os

changed = 0
for p in glob.glob('*.html') + glob.glob('details/*.html') + glob.glob('colleges/*.html'):
    html = open(p, encoding='utf-8').read()
    if 'js/theme.js' in html or 'css/theme' in html:
        continue
    if 'js/main.js' not in html:
        # 没有 main.js 的页面也注入（author/bilibili 可能有自定义路径）
        m = re.search(r'<script src="(?:\.\./)?js/(main|liquid-glass|author)\.js"', html)
        if not m:
            # 在 </body> 前注入
            html = html.replace('</body>', '  <script src="../js/theme.js"></script>\n</body>'
                                if '/' in p else '  <script src="js/theme.js"></script>\n</body>')
            changed += 1
            print(p, ': injected before </body>')
            open(p, 'w', encoding='utf-8').write(html)
            continue
    # 相对路径
    prefix = '../' if '/' in p else ''
    html = re.sub(r'<script src="((?:\.\./)?js/)main\.js"></script>',
                  r'<script src="\1theme.js"></script>\n  <script src="\1main.js"></script>', html, count=1)
    changed += 1
    print(p, ': injected before main.js')
    open(p, 'w', encoding='utf-8').write(html)
print('total changed:', changed)
