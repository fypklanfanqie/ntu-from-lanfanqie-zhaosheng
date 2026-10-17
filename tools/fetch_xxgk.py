# -*- coding: utf-8 -*-
"""抓取 xxgk 2025-11-10 版综测细则页面 + PDF"""
import urllib.request, re

url = 'https://xxgk.ntu.edu.cn/2025/1110/c9157a276507/page.htm'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req, timeout=40).read().decode('utf-8', 'ignore')
open('tools/xxgk_276507.html', 'w', encoding='utf-8').write(html)
print('len:', len(html))
mt = re.search(r'<title>(.*?)</title>', html, re.S)
print('title:', mt.group(1).strip() if mt else '?')

pdfs = re.findall(r'pdfsrc=["\']([^"\']+)["\']', html)
links = re.findall(r'href=["\']([^"\']*_upload[^"\']*\.(?:pdf|doc|docx|xls|xlsx))["\']', html)
print('pdfsrc:', pdfs)
print('upload links:', list(dict.fromkeys(links))[:5])

m = re.search(r'wp_articlecontent[\s\S]*?>([\s\S]*?)</div>', html)
if m:
    body = re.sub(r'<[^>]+>', ' ', m.group(1))
    print('body:', re.sub(r'\s+', ' ', body)[:400])

# 下载 PDF
target = (pdfs[0] if pdfs else (list(dict.fromkeys(links))[0] if links else ''))
if target:
    if target.startswith('/'):
        target = 'https://xxgk.ntu.edu.cn' + target
    data = urllib.request.urlopen(urllib.request.Request(target, headers={'User-Agent': 'Mozilla/5.0'}), timeout=60).read()
    open('tools/xxgk_276507.pdf', 'wb').write(data)
    print('downloaded', len(data), 'bytes ->', target)
