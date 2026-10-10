# -*- coding: utf-8 -*-
"""静态检查：引用路径完整性 + 标签配对"""
import re, os, sys

pages = ['index.html', 'zongce/index.html', 'zongce/calculator.html',
         'zongce/tracker.html', 'zongce/other.html']
ok = True
for p in pages:
    html = open(p, encoding='utf-8').read()
    base = os.path.dirname(p)
    refs = re.findall(r'(?:src|href)="([^"#?]+?)(?:[?#].*)?"', html)
    for r in refs:
        if r.startswith(('http', 'mailto:', 'data:', 'javascript:', "'")):
            continue
        path = os.path.normpath(os.path.join(base, r))
        if not os.path.exists(path):
            print('BROKEN', p, '->', r)
            ok = False
    for tag in ['div', 'section', 'main', 'nav', 'select', 'table', 'footer',
                'button', 'form', 'ul', 'li', 'a']:
        o = len(re.findall(r'<' + tag + r'[\s>]', html))
        c = len(re.findall(r'</' + tag + r'>', html))
        if o != c:
            print('TAG MISMATCH', p, tag, o, c)
            ok = False
print('ALL OK' if ok else 'ISSUES FOUND')
sys.exit(0 if ok else 1)
