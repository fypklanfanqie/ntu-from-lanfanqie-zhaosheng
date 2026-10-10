# -*- coding: utf-8 -*-
"""
南通大学大学生学科竞赛目录（2026年版）PDF → 结构化 JS 数据
来源: https://cxcyxy.ntu.edu.cn/_upload/article/files/e5/2f/9a51e75d4bd2bccc91055d9aec61/149bec4b-0390-4354-b568-fe482b3834ec.pdf
用法: python tools/build_competitions.py  （在仓库根目录执行）
"""
import re, json, sys
import pdfplumber

PDF = 'competition-catalog.pdf'
OUT_JS = 'js/competitions-data.js'

# 承办学院/部门 → 文理科 归属（参照南招生学科门类常识：医学/工/理/体育=理，人文/经管/教育/外语/艺术=文，校级部门=综）
COLLEGE_FIELD = {
    '文学院': '文', '历史文化学院（法学院）': '文', '法学院': '文',
    '数学与统计学院': '理', '物理科学与技术学院': '理', '马克思主义学院': '文',
    '商学院（管理学院）': '文', '教育科学学院': '文', '教师教育学院': '文',
    '外国语学院': '文', '化学化工学院': '理', '生命科学学院（海洋学院）': '理',
    '机械工程学院': '理', '信息科学技术学院（通科微电子学院）': '理',
    '微电子学院（集成电路学院）': '理', '人工智能与计算机学院（阿里云大数据学院）': '理',
    '电气与自动化学院': '理', '纺织服装学院': '理', '医学院': '理',
    '护理与康复学院': '理', '公共卫生学院': '理', '体育科学学院': '理',
    '支云足球学院': '理', '艺术学院（建筑学院）': '文', '地理科学学院': '理',
    '交通与土木工程学院（交通学院）': '理', '交通学院': '理', '药学院': '理',
    '国际教育学院': '文', '张謇学院': '理', '锡耶纳未来生物技术学院': '理',
    '创新创业教育学院': '综', '南通大学创新创业教育学院': '综', '团委': '综',
    '学生工作处': '综', '工程训练中心': '综', '研究生院': '综', '图书馆': '综',
}
# 展示名归一（把 PDF 里的零散写法合并成官方院系名）
COLLEGE_ALIAS = {
    '交通学院': '交通与土木工程学院（交通学院）',
    '信息科学技术学院': '信息科学技术学院（通科微电子学院）',
    '信息科学技术学院（通科微电子学院）': '信息科学技术学院（通科微电子学院）',
    '微电子学院': '微电子学院（集成电路学院）',
    '微电子学院（集成电路学院）': '微电子学院（集成电路学院）',
    '人工智能与计算机学院': '人工智能与计算机学院（阿里云大数据学院）',
    '生命科学学院': '生命科学学院（海洋学院）',
    '历史文化学院': '历史文化学院（法学院）',
    '艺术学院': '艺术学院（建筑学院）',
    '商学院': '商学院（管理学院）',
    '南通大学创新创业教育学院': '创新创业教育学院',
}

def norm(s):
    s = (s or '').replace('\n', '').replace('\r', '').replace(' ', '').replace('\u3000', '')
    return s

def norm_college(c):
    c = norm(c)
    c = c.replace('、', ',').strip(',')
    parts = [p for p in c.split(',') if p]
    out = []
    for p in parts:
        p = COLLEGE_ALIAS.get(p, p)
        if p and p not in out:
            out.append(p)
    return out

def parse_cat(raw):
    """Ⅰ类甲层次 → (class='Ⅰ', tier='甲')"""
    raw = norm(raw)
    m = re.match(r'([ⅠⅢⅡ]+)类([甲乙丙丁])层次?', raw)
    if m:
        return m.group(1), m.group(2)
    return raw, ''

def main():
    rows = []
    with pdfplumber.open(PDF) as pdf:
        for page in pdf.pages:
            for t in page.extract_tables():
                for r in t:
                    rows.append([norm(c) for c in (r + [''] * 5)[:5]])

    comps = []
    cur = None
    sports_section = False
    for r in rows:
        no, name, host, org, cat = r[0], r[1], r[2], r[3], r[4]
        if no == '序号':  # 每页表头
            if '体育类' in ' '.join(r):
                sports_section = True
            continue
        if not no and not name and not host and not org and not cat:
            continue
        if re.fullmatch(r'\d+', no):
            if cur:
                comps.append(cur)
            cur = {'no': int(no), 'name': name, 'host': host, 'org': org, 'cat': cat,
                   'sports': sports_section}
        else:
            # 续行：拼接到当前条目
            if cur is None:
                continue
            if name and name not in cur['name']:
                cur['name'] += name
            if host and host not in cur['host']:
                cur['host'] += host
            if org and org not in cur['org']:
                cur['org'] += org
            if cat and cat not in cur['cat']:
                cur['cat'] += cat
    if cur:
        comps.append(cur)

    # 校验：序号应连续 1..172
    nos = [c['no'] for c in comps]
    assert nos == list(range(1, len(comps) + 1)), f'序号不连续: {nos[:20]}...'

    items = []
    for c in comps:
        orgs = norm_college(c['org'])
        fields = set()
        for o in orgs:
            f = COLLEGE_FIELD.get(o)
            if f:
                fields.add(f)
        if not fields:
            field = '综'
        elif '理' in fields:
            field = '理'
        elif '文' in fields:
            field = '文'
        else:
            field = '综'
        cls, tier = parse_cat(c['cat'])
        items.append({
            'no': c['no'], 'name': c['name'], 'host': c['host'],
            'orgs': orgs, 'class': cls, 'tier': tier,
            'field': field,
            # PDF 第11页为「体育类」专表，固定为第 160-172 项
            'sports': c['no'] >= 160,
        })

    # 输出 JS
    lines = []
    lines.append('/* ================================================================')
    lines.append('   南通大学大学生学科竞赛目录（2026年版）— 结构化数据')
    lines.append('   来源: 南通大学创新创业教育学院《南通大学大学生学科竞赛目录（2026年版）》')
    lines.append('   https://cxcyxy.ntu.edu.cn （学科竞赛条目 PDF）')
    lines.append('   由 tools/build_competitions.py 自动生成，请勿手工编辑竞赛条目；')
    lines.append('   官方链接(link)与检索别名(alias)字段为人工核验维护。')
    lines.append('   ================================================================ */')
    lines.append('(function(){')
    lines.append("'use strict';")
    lines.append('')
    lines.append('window.NTU_COMPETITIONS = ' + json.dumps(items, ensure_ascii=False, indent=2) + ';')
    lines.append('')
    lines.append('if (typeof module !== "undefined") module.exports = window.NTU_COMPETITIONS;')
    lines.append('})();')
    with open(OUT_JS, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines) + '\n')
    print(f'OK: {len(items)} competitions -> {OUT_JS}')
    # 摘要
    from collections import Counter
    print('类别分布:', Counter(f"{i['class']}类{i['tier']}" for i in items))
    print('文理分布:', Counter(i['field'] for i in items))
    print('体育类:', sum(1 for i in items if i['sports']))

if __name__ == '__main__':
    main()
