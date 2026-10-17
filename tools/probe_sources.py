# -*- coding: utf-8 -*-
"""探测各候选源：文章链接数量 + 日期格式"""
import urllib.request, re, sys

CANDIDATES = [
    ('创新创业 通知公告', 'https://cxcyxy.ntu.edu.cn/10412/list.htm'),
    ('创新创业 列表2', 'https://cxcyxy.ntu.edu.cn/10412/list2.htm'),
    ('创新创业 列表3', 'https://cxcyxy.ntu.edu.cn/10412/list3.htm'),
    ('创新创业 列表4', 'https://cxcyxy.ntu.edu.cn/10412/list4.htm'),
    ('创新创业 列表5', 'https://cxcyxy.ntu.edu.cn/10412/list5.htm'),
    ('机械学院 通知', 'https://sme.ntu.edu.cn/11619/list.htm'),
    ('机械学院 列表2', 'https://sme.ntu.edu.cn/11619/list2.htm'),
    ('教务处 通知公告', 'https://jwc.ntu.edu.cn/2024/list.htm'),
    ('教务处 学生通知', 'https://jwc.ntu.edu.cn/'),
    ('数统 通知', 'https://sms.ntu.edu.cn/'),
    ('信科 通知', 'https://sist.ntu.edu.cn/'),
    ('人工智能 通知', 'https://ai.ntu.edu.cn/'),
    ('电气 通知', 'https://dqxy.ntu.edu.cn/'),
    ('交通土木 通知', 'https://jttm.ntu.edu.cn/'),
    ('化工 通知', 'https://hgxy.ntu.edu.cn/'),
    ('纺服 通知', 'https://fzfz.ntu.edu.cn/'),
    ('生科 通知', 'https://smkxxy.ntu.edu.cn/'),
    ('地科 通知', 'https://geo.ntu.edu.cn/'),
    ('物理 通知', 'https://phys.ntu.edu.cn/'),
    ('医学院 通知', 'https://yxy.ntu.edu.cn/'),
    ('艺术学院 通知', 'https://ysxy.ntu.edu.cn/'),
    ('商学院 通知', 'https://sem.ntu.edu.cn/'),
    ('药学院 通知', 'https://phar.ntu.edu.cn/'),
    ('微电子 通知', 'https://meic.ntu.edu.cn'),
]

ART_RE = re.compile(r'<a[^>]+href=["\']([^"\']*?/20\d\d/\d{4}/c\d+a\d+/page\.htm)["\'][^>]*>(.*?)</a>', re.S)
DATE_RE = re.compile(r'20\d\d-\d\d-\d\d')

for name, url in CANDIDATES:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        html = urllib.request.urlopen(req, timeout=25).read().decode('utf-8', 'ignore')
        arts = ART_RE.findall(html)
        titles = [re.sub(r'<[^>]+>', '', t).strip() for _, t in arts]
        comp = [t for t in titles if re.search(r'竞赛|大赛|报名|选拔|挑战杯|锦标赛|创新创业', t)]
        print(f'{name:16s} | len={len(html):6d} | 文章链接={len(arts):3d} | 竞赛相关={len(comp):2d}', end='')
        if comp:
            print(' | 例:', comp[0][:34])
        else:
            print()
    except Exception as e:
        print(f'{name:16s} | ERR {str(e)[:50]}')
