# -*- coding: utf-8 -*-
"""
机械工程学院 2025-2026 综测细表 xlsx → 富文本级划线解析
被划掉(run级/格级 strike)的文字 = 不可加分；未划掉的 = 可加分
输出: js/other-bonus.js (数据) + tools/bonus_audit.txt (审计报告)
"""
import zipfile, re, json
from xml.etree import ElementTree as ET

XLSX = '智能制造专业综测细表.xlsx'
OUT_JS = 'js/other-bonus.js'
AUDIT = 'tools/bonus_audit.txt'

NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}

def parse_shared_strings():
    """返回 [(text, strike), ...] 列表的列表，按 sharedString 索引"""
    z = zipfile.ZipFile(XLSX)
    xml = z.read('xl/sharedStrings.xml').decode('utf-8')
    root = ET.fromstring(xml)
    result = []
    for si in root.findall('m:si', NS):
        runs = []
        r_elems = si.findall('m:r', NS)
        if r_elems:
            for r in r_elems:
                t = r.find('m:t', NS)
                text = (t.text or '') if t is not None else ''
                rpr = r.find('m:rPr', NS)
                strike = rpr is not None and rpr.find('m:strike', NS) is not None
                runs.append((text, strike))
        else:
            t = si.find('m:t', NS)
            runs.append(((t.text or '') if t is not None else '', False))
        result.append(runs)
    return result

def parse_style_strike_fonts():
    """styles.xml → 每个 font 是否 strike"""
    z = zipfile.ZipFile(XLSX)
    xml = z.read('xl/styles.xml').decode('utf-8')
    root = ET.fromstring(xml)
    fonts = []
    fonts_el = root.find('m:fonts', NS)
    for f in fonts_el.findall('m:font', NS):
        fonts.append(f.find('m:strike', NS) is not None)
    # cellXfs: xf 引用 fontId
    xfs = []
    cellxfs = root.find('m:cellXfs', NS)
    for xf in cellxfs.findall('m:xf', NS):
        xfs.append(int(xf.get('fontId', '0')))
    return fonts, xfs

def cell_ref_to_rc(ref):
    m = re.match(r'([A-Z]+)(\d+)', ref)
    col = 0
    for ch in m.group(1):
        col = col * 26 + (ord(ch) - 64)
    return int(m.group(2)), col

def main():
    z = zipfile.ZipFile(XLSX)
    shared = parse_shared_strings()
    strike_fonts, xfs = parse_style_strike_fonts()

    sheet_xml = z.read('xl/worksheets/sheet1.xml').decode('utf-8')
    root = ET.fromstring(sheet_xml)
    cells = {}  # (row,col) -> {'type','idx'/'raw','style'}
    for c in root.iter('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
        ref = c.get('r')
        t = c.get('t', 'n')
        s = int(c.get('s', '0'))
        v = c.find('m:v', NS)
        val = v.text if v is not None else ''
        rc = cell_ref_to_rc(ref)
        cells[rc] = {'t': t, 'v': val, 's': s}

    def cell_display(rc):
        """返回 (纯文本, 段落列表[(text,strike)])"""
        c = cells.get(rc)
        if c is None:
            return '', []
        if c['t'] == 's':
            idx = int(c['v'])
            runs = shared[idx]
            text = ''.join(t for t, _ in runs)
            # 格级 strike：全部段标 strike
            if strike_fonts[xfs[c['s']]]:
                runs = [(t, True) for t, _ in runs]
            return text, runs
        return c['v'] or '', [(c['v'] or '', False)]

    # 列: A班级 B学号 C姓名 D德育 E智育 F体育 G美育 H劳育
    from collections import defaultdict
    records = []
    for row in range(3, 85):
        _, name_runs = cell_display((row, 3))
        name = ''.join(t for t, _ in name_runs).strip()
        if not name:
            continue
        cls, _ = cell_display((row, 1))
        cats = {}
        for col, key in [(4, '德育'), (5, '智育'), (6, '体育'), (7, '美育'), (8, '劳育')]:
            text, runs = cell_display((row, col))
            if text.strip():
                cats[key] = {'text': text, 'runs': runs}
        records.append({'row': row, 'cls': cls.strip(), 'name': name.strip(), 'cats': cats})

    # ============ 归纳可加/不可加条目 ============
    # 把每个 run 段（按换行切）作为独立加分项，收集:
    #   valid: 未划线段落 -> 分值、原文
    #   invalid: 划线段落
    item_pat = re.compile(r'^\s*(\d+)[\.、．]?\s*')
    score_pat = re.compile(r'[（(]([＋+]?[\d\.]+)分?[）)]')

    valid_items = defaultdict(list)   # cat -> [(name_norm, score, raw, who)]
    invalid_items = defaultdict(list)
    for rec in records:
        for cat, obj in rec['cats'].items():
            # 段落按 run 边界近似合并：先把 runs 拼回文本并保留 strike 标记
            # 策略：run 级 strike 表示该 run 被划掉
            for line in split_lines(obj['runs']):
                txt, strikes = line
                t = txt.strip()
                if not t:
                    continue
                clean = item_pat.sub('', t).strip()
                m = score_pat.search(clean)
                score = m.group(1) if m else ''
                name_norm = re.sub(r'https?://\S+', '', clean).strip()
                name_norm = re.sub(r'[（(][＋+]?[\d\.]+分?[）)]', '', name_norm).strip('。 .，,')
                if not name_norm:
                    continue
                if strikes:
                    invalid_items[cat].append({'raw': t, 'who': rec['name']})
                else:
                    valid_items[cat].append({'name': name_norm, 'score': score, 'raw': t, 'who': rec['name']})

    # 聚合同名项（去重，统计出现次数）
    def agg(items, key='name'):
        seen = {}
        for it in items:
            k = it[key]
            if k not in seen:
                seen[k] = {'name': it[key], 'score': it.get('score', ''), 'count': 0, 'raw': it['raw']}
            seen[k]['count'] += 1
        return sorted(seen.values(), key=lambda x: -x['count'])

    out = {cat: agg(v) for cat, v in valid_items.items()}
    invalid = {cat: agg(v, key='raw') for cat, v in invalid_items.items()}

    # 审计报告
    with open(AUDIT, 'w', encoding='utf-8') as f:
        f.write('机械工程学院 2025-2026 综测加分条目审计（来源：智能制造专业综测细表.xlsx）\n')
        f.write('未划线=可加分；划线=不可加分（第一次审核否决）\n\n')
        for cat in ['德育', '智育', '体育', '美育', '劳育']:
            f.write(f'===== {cat} · 可加（{len(out.get(cat, []))} 项）=====\n')
            for it in out.get(cat, []):
                f.write(f"  [{it['count']:2d}次] {it['score'] or '??':>6}  {it['name']}\n")
            f.write(f'----- {cat} · 不可加（{len(invalid.get(cat, []))} 项）-----\n')
            for it in invalid.get(cat, []):
                f.write(f"  [{it['count']:2d}次] {it['name']}\n")
            f.write('\n')

    # 输出 JS
    data = {
        'meta': {
            'scope': '仅代表 2025-2026 学年机械工程学院综合测评口径',
            'source': '机械工程学院综测加分统计实表（智能制造专业）+ 全院审核疑问汇总',
            'updated': '2026-10',
            'note': '被划掉的条目（第一次审核未通过）已单独列出，不参与加分。',
        },
        'valid': out,
        'invalid': invalid,
    }
    js = []
    js.append('/* ================================================================')
    js.append('   机械工程学院综测「其他加分」数据（2025-2026 学年口径）')
    js.append('   来源: 机械工程学院综测加分统计实表 + 综测第一次审核疑问汇总')
    js.append('   由 tools/build_other_bonus.py 自动生成：未划线=可加分，划线=不可加分')
    js.append('   ================================================================ */')
    js.append('(function(global){')
    js.append("'use strict';")
    js.append('global.NTU_OTHER_BONUS = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';')
    js.append('if (typeof module !== "undefined") module.exports = global.NTU_OTHER_BONUS;')
    js.append('})(typeof window !== "undefined" ? window : globalThis);')
    with open(OUT_JS, 'w', encoding='utf-8') as f:
        f.write('\n'.join(js) + '\n')

    print(f'valid cats: { {k: len(v) for k, v in out.items()} }')
    print(f'invalid cats: { {k: len(v) for k, v in invalid.items()} }')
    print('->', OUT_JS, 'and', AUDIT)

def split_lines(runs):
    """把 [(text,strike)] 按换行切分成多行，行内任意 run strike 即整行 strike"""
    lines = []
    cur_txt, cur_strike = [], False
    for text, strike in runs:
        parts = re.split(r'(\n)', text)
        for p in parts:
            if p == '\n':
                if cur_txt:
                    lines.append((''.join(cur_txt), cur_strike))
                cur_txt, cur_strike = [], False
            elif p:
                cur_txt.append(p)
                cur_strike = cur_strike or strike
    if cur_txt:
        lines.append((''.join(cur_txt), cur_strike))
    return lines

if __name__ == '__main__':
    main()
