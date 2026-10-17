#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
多轮触发 Worker（每次 2 源 + 1 详情），把各源和详情逐步抓全
用法: python tools/trigger_multi.py [轮数]
"""
import json, subprocess, sys, time

ROUNDS = int(sys.argv[1]) if len(sys.argv) > 1 else 9
BASE = 'https://ntu-zongce-fetcher.lanfanqie.workers.dev'
PROXY = 'http://127.0.0.1:7897'

def call(path, method='GET', timeout=90):
    cmd = ['curl.exe', '-sS', '-x', PROXY, '--max-time', str(timeout), '-X', method, BASE + path]
    out = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore')
    try:
        return json.loads(out.stdout)
    except Exception:
        return {'raw': out.stdout[:400], 'err': out.stderr[:200]}

for i in range(ROUNDS):
    j = call('/api/trigger', 'POST')
    r = j.get('result') or {}
    st = r.get('stats') or {}
    print(f'round {i+1}/{ROUNDS} | sources={st.get("sources")} | total={st.get("total")} '
          f'matched={st.get("matched")} open={st.get("open")} soon={st.get("soon")} closed={st.get("closed")} '
          f'| took={r.get("tookMs")}ms | errs={len(st.get("errors") or [])}')
    for e in (st.get('errors') or [])[:2]:
        print('   err:', e.get('source'), str(e.get('error'))[:60])
    time.sleep(1.2)

print('\n=== 最终通知 ===')
n = call('/api/notifications')
d = n.get('data') or {}
items = d.get('items') or []
print('total:', len(items), '| updated:', d.get('updated'))
for it in items[:20]:
    print(f"  {it.get('date','?'):10s} {(it.get('status') or '?'):6s} "
          f"deadline={it.get('deadline') or '-':10s} {('有入口' if it.get('regUrl') else '  无 ')}  "
          f"{(it.get('title') or '')[:46]}")

print('\n=== 竞赛匹配 ===')
m = call('/api/matches')
mm = (m.get('data') or {}).get('matches') or {}
print('matched:', len(mm))
for no, v in sorted(mm.items(), key=lambda kv: int(kv[0])):
    title = ((v.get('notice') or {}).get('title') or '')[:44]
    print(f"  #{no:>3s} {v.get('status','?'):6s} deadline={v.get('deadline') or '-':10s} {title}")
