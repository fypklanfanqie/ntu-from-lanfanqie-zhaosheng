# -*- coding: utf-8 -*-
"""用快照里的真实通知 URL 验证截止时间提取"""
import json, re, urllib.request

snap = json.load(open('zongce/data/notifications-snapshot.json', encoding='utf-8'))
items = [i for i in snap['items'] if i.get('url')][:12]

CN_DATE = re.compile(r'(20\d{2})\s*[年.\-/]\s*(\d{1,2})\s*[月.\-/]\s*(\d{1,2})\s*日?')
CN_SHORT = re.compile(r'(\d{1,2})\s*月\s*(\d{1,2})\s*日')

def text_of(url):
    h = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=30).read().decode('utf-8', 'ignore')
    m = re.search(r'wp_articlecontent[\s\S]{0,200}?>([\s\S]*?)</div>', h)
    body = m.group(1) if m else h
    body = re.sub(r'<script[\s\S]*?</script>', ' ', body)
    body = re.sub(r'<style[\s\S]*?</style>', ' ', body)
    body = re.sub(r'<[^>]+>', ' ', body).replace('&nbsp;', ' ')
    return re.sub(r'\s+', ' ', body)

def to_iso(y, m, d): return f'{y}-{int(m):02d}-{int(d):02d}'

def extract_deadline(text, year):
    sents = [s.strip() for s in re.split(r'[。；;！\n\r]', text) if len(s.strip()) > 3]
    dl = [s for s in sents if re.search(r'截止|截至', s) and re.search(r'报名|申报|提交|材料|作品|回执|报送', s)]
    for s in dl:
        m = CN_DATE.search(s)
        if m: return to_iso(m.group(1), m.group(2), m.group(3))
    for s in dl:
        m = re.search(r'(\d{1,2})\s*月\s*(\d{1,2})\s*日', s)
        if m: return to_iso(year, m.group(1), m.group(2))
    for s in [x for x in sents if re.search(r'报名时间|报名日期', x)]:
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

print(f'{"通知":<42} {"提取截止":<12} 正文关键句')
print('-' * 120)
for it in items:
    try:
        t = text_of(it['url'])
        dl = extract_deadline(t, (it.get('date') or '')[:4])
        keys = re.findall(r'[^。；]{0,20}(?:截止|截至)[^。；]{0,50}', t)[:1]
        k = (keys[0].strip()[:70] if keys else '')
        print(f'{(it.get("title") or "")[:40]:<42} {(dl or "(无)"):<12} {k}')
    except Exception as e:
        print(f'{(it.get("title") or "")[:40]:<42} ERR {str(e)[:40]}')
