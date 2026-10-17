# -*- coding: utf-8 -*-
"""用真实通知正文验证「报名截止」提取准确度"""
import urllib.request, re, json

ARTS = [
    ('2026-07-14', '关于举办2026年南通大学大学生数学建模竞赛的通知', 'https://cxcyxy.ntu.edu.cn/2026/0714/c10412a295729/page.htm'),
    ('2026-09-22', '关于举办2026全国大学生智能审计技能竞赛的通知', 'https://sem.ntu.edu.cn/2026/0922/c11410a299355/page.htm'),
    ('2026-09-18', '税收风险管控案例大赛江苏省分区赛南通大学校赛', 'https://sem.ntu.edu.cn/2026/0918/c11410a299200/page.htm'),
    ('2026-10-12', '2026年江苏省科云杯大学生财会职业能力大赛校内选拔赛', 'https://sem.ntu.edu.cn/2026/1012/c11410a300115/page.htm'),
]

CN_DATE = re.compile(r'(20\d{2})\s*[年.\-/]\s*(\d{1,2})\s*[月.\-/]\s*(\d{1,2})\s*日?')
CN_SHORT = re.compile(r'(\d{1,2})\s*月\s*(\d{1,2})\s*日')

def text_of(url):
    h = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=30).read().decode('utf-8', 'ignore')
    m = re.search(r'wp_articlecontent[\s\S]{0,200}?>([\s\S]*?)</div>', h)
    body = m.group(1) if m else h
    body = re.sub(r'<script[\s\S]*?</script>', ' ', body)
    body = re.sub(r'<style[\s\S]*?</style>', ' ', body)
    body = re.sub(r'<[^>]+>', ' ', body)
    body = body.replace('&nbsp;', ' ')
    return re.sub(r'\s+', ' ', body)

def to_iso(y, m, d):
    return f'{y}-{int(m):02d}-{int(d):02d}'

def extract_deadline(text, year):
    sents = [s.strip() for s in re.split(r'[。；;！\n\r]', text) if len(s.strip()) > 3]
    dl = [s for s in sents if re.search(r'截止|截至', s) and re.search(r'报名|申报|提交|材料|作品|回执|报送', s)]
    for s in dl:
        m = CN_DATE.search(s)
        if m: return to_iso(m.group(1), m.group(2), m.group(3))
    for s in dl:
        m = re.search(r'(\d{1,2})\s*月\s*(\d{1,2})\s*日', s)
        if m: return to_iso(year, m.group(1), m.group(2))
    rg = [s for s in sents if re.search(r'报名时间|报名日期', s)]
    for s in rg:
        ds = re.findall(r'(?:20\d{2}\s*[年.\-/]\s*)?(\d{1,2})\s*[月.\-/]\s*(\d{1,2})\s*日', s)
        if len(ds) >= 2:
            y = (re.search(r'(20\d{2})\s*[年.\-/]', s) or [None, year])[1]
            return to_iso(y, ds[-1][0], ds[-1][1])
    for s in sents:
        if re.search(r'报名|提交|申报|报送', s) and '前' in s:
            m = CN_DATE.search(s)
            if m: return to_iso(m.group(1), m.group(2), m.group(3))
            m = CN_SHORT.search(s)
            if m: return to_iso(year, m.group(1), m.group(2))
    return ''

for date, name, url in ARTS:
    try:
        t = text_of(url)
        dl = extract_deadline(t, date[:4])
        # 附带：正文里的关键句子，便于人工核对
        key = re.findall(r'[^。；]{0,28}(?:截止|截至)[^。；]{0,40}', t)[:2]
        print(f'--- {name[:36]}')
        print(f'    提取截止: {dl or "(无)"}')
        for k in key: print('    原文:', k.strip()[:90])
    except Exception as e:
        print(f'--- {name[:36]}  ERR {str(e)[:60]}')
