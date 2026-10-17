# -*- coding: utf-8 -*-
"""探测学院 通知公告 栏目（常见 URL 模式）"""
import urllib.request, re

COLLEGES = {
    '信科': 'https://sist.ntu.edu.cn/',
    '人工智能': 'https://ai.ntu.edu.cn/',
    '电气': 'https://dqxy.ntu.edu.cn/',
    '交通土木': 'https://jttm.ntu.edu.cn/',
    '化工': 'https://hgxy.ntu.edu.cn/',
    '纺服': 'https://fzfz.ntu.edu.cn/',
    '地科': 'https://geo.ntu.edu.cn/',
    '物理': 'https://phys.ntu.edu.cn/',
    '数统': 'https://sms.ntu.edu.cn/',
    '医学院': 'https://yxy.ntu.edu.cn/',
    '艺术': 'https://ysxy.ntu.edu.cn/',
    '商院': 'https://sem.ntu.edu.cn/',
    '药学院': 'https://phar.ntu.edu.cn/',
    '机械': 'https://sme.ntu.edu.cn/',
}
PATTERNS = ['tzgg/list.htm', 'xwzx/list.htm', 'xsgz/list.htm', 'tzg/list.htm', 'notice/list.htm', 'xwdt/list.htm']
ART_RE = re.compile(r'<a[^>]+href=["\']([^"\']*?/20\d\d/\d{4}/c\d+a\d+/page\.htm)["\'][^>]*>(.*?)</a>', re.S)

def find_notice_college(url):
    html = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=20).read().decode('utf-8', 'ignore')
    # 从导航里找含"通知"的栏目
    links = re.findall(r'<a[^>]+href=["\']([^"\']*list\d*\.htm)["\'][^>]*>([^<]{2,16})</a>', html)
    cand = [(h, t) for h, t in links if '通知' in t or '公告' in t]
    return cand

for name, base in COLLEGES.items():
    try:
        cand = find_notice_college(base)
        best = None
        for href, text in cand:
            full = base.rstrip('/') + '/' + href.lstrip('/')
            try:
                h = urllib.request.urlopen(urllib.request.Request(full, headers={'User-Agent': 'Mozilla/5.0'}), timeout=15).read().decode('utf-8', 'ignore')
                arts = ART_RE.findall(h)
                comp = [(u, re.sub(r'<[^>]+>', '', t).strip()) for u, t in arts if re.search(r'竞赛|大赛|报名|选拔', re.sub(r'<[^>]+>', '', t))]
                if len(comp) >= 1:
                    best = (text, full, len(arts), len(comp), comp[0][1][:36])
                    break
            except Exception:
                continue
        print(f'{name:6s}', '|', best if best else '(无竞赛通知栏目)')
    except Exception as e:
        print(f'{name:6s} | ERR {str(e)[:40]}')
