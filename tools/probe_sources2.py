# -*- coding: utf-8 -*-
"""探测 cxcyxy 竞赛专栏 + 更多分页 + 教务处通知分页"""
import urllib.request, re

CANDIDATES = [
    ('创新竞赛专栏', 'https://cxcyxy.ntu.edu.cn/10417/list.htm'),
    ('创新竞赛 列2', 'https://cxcyxy.ntu.edu.cn/10417/list2.htm'),
    ('新闻动态', 'https://cxcyxy.ntu.edu.cn/10413/list.htm'),
    ('通知 list6', 'https://cxcyxy.ntu.edu.cn/10412/list6.htm'),
    ('通知 list7', 'https://cxcyxy.ntu.edu.cn/10412/list7.htm'),
    ('通知 list8', 'https://cxcyxy.ntu.edu.cn/10412/list8.htm'),
    ('通知 list10', 'https://cxcyxy.ntu.edu.cn/10412/list10.htm'),
    ('教务处 通知 list', 'https://jwc.ntu.edu.cn/1613/list.htm'),
    ('教务处 教务通知', 'https://jwc.ntu.edu.cn/1614/list.htm'),
    ('团委', 'https://tw.ntu.edu.cn/'),
    ('学工处', 'https://xgc.ntu.edu.cn/'),
]

ART_RE = re.compile(r'<a[^>]+href=["\']([^"\']*?/20\d\d/\d{4}/c\d+a\d+/page\.htm)["\'][^>]*>(.*?)</a>', re.S)

for name, url in CANDIDATES:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        html = urllib.request.urlopen(req, timeout=25).read().decode('utf-8', 'ignore')
        arts = ART_RE.findall(html)
        titles = [(u, re.sub(r'<[^>]+>', '', t).strip()) for u, t in arts]
        comp = [(u, t) for u, t in titles if re.search(r'竞赛|大赛|报名|选拔|挑战杯|锦标赛|创新创业', t)]
        print(f'== {name} | 文章={len(arts)} | 竞赛相关={len(comp)}')
        for u, t in comp[:5]:
            m = re.search(r'/20(\d\d)/(\d{4})/', u)
            date = f'20{m.group(1)}-{m.group(2)[:2]}-{m.group(2)[2:]}' if m else '?'
            print(f'   {date} | {t[:52]}')
    except Exception as e:
        print(f'== {name} | ERR {str(e)[:60]}')
