# -*- coding: utf-8 -*-
"""检查几篇未提取到截止的通知正文，寻找新句式"""
import json, re, urllib.request

snap = json.load(open('zongce/data/notifications-snapshot.json', encoding='utf-8'))
TARGETS = ['企业决策赛道', '财会职业能力大赛校内选拔赛', '智能审计']

def text_of(url):
    h = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'}), timeout=30).read().decode('utf-8', 'ignore')
    m = re.search(r'wp_articlecontent[\s\S]{0,200}?>([\s\S]*?)</div>', h)
    body = m.group(1) if m else h
    body = re.sub(r'<script[\s\S]*?</script>', ' ', body)
    body = re.sub(r'<style[\s\S]*?</style>', ' ', body)
    body = re.sub(r'<[^>]+>', ' ', body).replace('&nbsp;', ' ')
    return re.sub(r'\s+', ' ', body)

for it in snap['items']:
    t = it.get('title') or ''
    if not any(k in t for k in TARGETS):
        continue
    print('=' * 100)
    print('标题:', t)
    print('URL :', it['url'])
    try:
        text = text_of(it['url'])
        print('长度:', len(text))
        # 打印含日期/报名/截止/时间的所有片段
        for m in re.finditer(r'[^。；]{0,40}(?:截止|报名|时间|日期|前)[^。；]{0,60}', text):
            s = m.group(0).strip()
            if re.search(r'\d', s):
                print('  ·', s[:110])
    except Exception as e:
        print('ERR', str(e)[:60])
