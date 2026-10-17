# -*- coding: utf-8 -*-
"""探测教务处/团委/学工处 通知公告栏目真实 URL + cxcyxy 文章详情页结构（找报名截止）"""
import urllib.request, re

def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    return urllib.request.urlopen(req, timeout=25).read().decode('utf-8', 'ignore')

# 1) 教务处导航找通知栏目
html = get('https://jwc.ntu.edu.cn/')
cols = re.findall(r'<a[^>]+href=["\']([^"\']*list\.htm)["\'][^>]*>([^<]{2,20})</a>', html)
print('教务处栏目:', [c for c in dict(cols).items()][:20])

# 2) 详情页结构：取一条竞赛通知
art = 'https://cxcyxy.ntu.edu.cn/2026/0714/c10412a295729/page.htm'
h = get(art)
text = re.sub(r'<script[\s\S]*?</script>', '', h)
text = re.sub(r'<style[\s\S]*?</style>', '', text)
text = re.sub(r'<[^>]+>', ' ', text)
text = re.sub(r'\s+', ' ', text)
print('\n详情页长度:', len(text))
for kw in ['报名', '截止', '时间', '作品提交']:
    idx = text.find(kw)
    if idx > 0:
        print(f'[{kw}]', text[max(0, idx-60):idx+120])
