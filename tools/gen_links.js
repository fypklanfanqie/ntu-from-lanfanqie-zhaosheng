/**
 * 生成完整的竞赛入口链接表：
 *  - official: 已核验的主办方官网
 *  - college : 无官网时 → 承办学院/部门官网（稳定可达）
 * 输出 js/competition-links.js
 */
const fs = require('fs');
const { execFileSync } = require('child_process');
const comps = require('../js/competitions-data.js');
const OLD = require('../js/competition-links.js');

/* 已核验官方站（沿用） */
const OFFICIAL = {};
Object.entries(OLD).forEach(([no, v]) => { if (v[0]) OFFICIAL[no] = v[0]; });

/* 学院/部门官网（来自学校院系设置页，均已访问验证） */
const UNIT_SITE = {
  '文学院': ['https://wxy.ntu.edu.cn/', '文学院'],
  '历史文化学院（法学院）': ['https://lfxy.ntu.edu.cn/', '历史文化学院（法学院）'],
  '数学与统计学院': ['https://sms.ntu.edu.cn/', '数学与统计学院'],
  '物理科学与技术学院': ['https://phys.ntu.edu.cn/', '物理科学与技术学院'],
  '马克思主义学院': ['https://mkszyxy.ntu.edu.cn/', '马克思主义学院'],
  '商学院（管理学院）': ['https://sem.ntu.edu.cn/', '商学院（管理学院）'],
  '教育科学学院': ['https://jky.ntu.edu.cn/', '教育科学学院'],
  '教师教育学院': ['https://jsjy.ntu.edu.cn/', '教师教育学院'],
  '外国语学院': ['https://sfl.ntu.edu.cn/', '外国语学院'],
  '化学化工学院': ['https://hgxy.ntu.edu.cn/', '化学化工学院'],
  '生命科学学院（海洋学院）': ['https://smkxxy.ntu.edu.cn/', '生命科学学院（海洋学院）'],
  '机械工程学院': ['https://sme.ntu.edu.cn/', '机械工程学院'],
  '信息科学技术学院（通科微电子学院）': ['https://sist.ntu.edu.cn/', '信息科学技术学院'],
  '微电子学院（集成电路学院）': ['https://meic.ntu.edu.cn/', '微电子学院'],
  '人工智能与计算机学院（阿里云大数据学院）': ['https://ai.ntu.edu.cn/', '人工智能与计算机学院'],
  '电气与自动化学院': ['https://dqxy.ntu.edu.cn/', '电气与自动化学院'],
  '纺织服装学院': ['https://fzfz.ntu.edu.cn/', '纺织服装学院'],
  '医学院': ['https://yxy.ntu.edu.cn/', '医学院'],
  '护理与康复学院': ['https://ntdxhk.ntu.edu.cn/', '护理与康复学院'],
  '公共卫生学院': ['https://gw.ntu.edu.cn/', '公共卫生学院'],
  '体育科学学院': ['https://tky.ntu.edu.cn/', '体育科学学院'],
  '支云足球学院': ['https://zyzqxy.ntu.edu.cn/', '支云足球学院'],
  '艺术学院（建筑学院）': ['https://ysxy.ntu.edu.cn/', '艺术学院'],
  '地理科学学院': ['https://geo.ntu.edu.cn/', '地理科学学院'],
  '交通与土木工程学院（交通学院）': ['https://jttm.ntu.edu.cn/', '交通与土木工程学院'],
  '药学院': ['https://phar.ntu.edu.cn/', '药学院'],
  '国际教育学院': ['https://sie.ntu.edu.cn/', '国际教育学院'],
  '张謇学院': ['https://zjxy.ntu.edu.cn/', '张謇学院'],
  '锡耶纳未来生物技术学院': ['https://xyn.ntu.edu.cn/', '锡耶纳未来生物技术学院'],
  '创新创业教育学院': ['https://cxcyxy.ntu.edu.cn/', '创新创业教育学院'],
  '团委': ['https://tw.ntu.edu.cn/', '校团委'],
  '学生工作处': ['https://xgc.ntu.edu.cn/', '学生工作处'],
  '教务处': ['https://jwc.ntu.edu.cn/', '教务处'],
  '研究生院': ['https://yjs.ntu.edu.cn/', '研究生院'],
  '工程训练中心': ['https://gxzx.ntu.edu.cn/', '工程训练中心'],
  '图书馆': ['https://lib.ntu.edu.cn/', '图书馆'],
  '实验室与设备管理处': ['https://sbc.ntu.edu.cn/', '实验室与设备管理处'],
};

/* 额外官方站候选（待验证，仅保留 200） */
const EXTRA_CANDIDATES = {
  5:  ['https://www.cmda.net/', '中国大学生医学技术技能大赛'],
  22: ['https://pec.nju.edu.cn/', '全国大学生物理实验竞赛'],
  26: ['http://www.chinastatistics.org.cn/', '全国大学生统计建模大赛'],
  27: ['https://www.csgpc.org.cn/', '全国大学生测绘学科创新创业智能大赛'],
  28: ['http://www.caairobot.com/', '中国机器人及人工智能大赛'],
  33: ['https://cpipc.acge.org.cn/', '中国研究生创新实践系列大赛'],
  41: ['http://www.chinassc.org/', '全国大学生市场调查与分析大赛'],
  45: ['https://contest.i21st.cn/', '21世纪杯'],
  49: ['https://iche.zju.edu.cn/', '全国大学生化工设计竞赛'],
  51: ['http://www.chemsoc.org.cn/', '全国大学生化学实验创新设计大赛'],
  57: ['http://www.socchina.net/', '全国大学生嵌入式芯片与系统设计竞赛'],
  59: ['https://matiji.net/', '码蹄杯'],
  62: ['https://gplt.patest.cn/', '中国高校计算机大赛'],
  63: ['https://www.brcomp.org.cn/', '一带一路暨金砖国家技能发展与技术创新大赛'],
  65: ['https://www.brcomp.org.cn/', '一带一路暨金砖国家技能发展与技术创新大赛'],
  67: ['https://www.huacanjiang.com/', '华灿奖'],
  70: ['https://www.cdec.org.cn/', '全国大学生数字媒体科技作品及创意竞赛'],
  71: ['https://www.ncda.org.cn/', '未来设计师·NCDA'],
  72: ['https://www.cdec.org.cn/', '中国好创意'],
  78: ['https://www.tianjiabing.org/', '田家炳杯'],
  79: ['https://www.calis.edu.cn/', '大学生AI+信息素养大赛'],
  82: ['https://www.china-cic.cn/', 'CIC悟空杯'],
  83: ['https://www.sizhengke.net/', '全国高校大学生讲思政课'],
  88: ['http://www.chinacaa.org/', '全国大学生智能审计技能竞赛'],
  89: ['http://www.chinawuliu.com.cn/', '全国供应链大赛'],
  92: ['http://www.peoplechina.com.cn/', '人民中国杯'],
  93: ['https://www.cipedu.com.cn/', '词达人杯'],
  94: ['https://www.pigai.org/', '批改网杯'],
  100: ['https://dasai.lanqiao.cn/', '蓝桥杯'],
  101: ['https://match.xinje.com/', '信捷杯'],
  110: ['http://www.ctes.cn/', '中国纺织类高校创意创新创业大赛'],
  112: ['https://www.cmda.net/', '习酒杯'],
  119: ['https://www.moe.gov.cn/', '美育再浸润'],
  123: ['https://www.esrichina.com.cn/', '易智瑞杯GIS'],
  129: ['https://topics.gmw.cn/node_163037.htm', '健康科普作品征集'],
  130: ['http://www.cpu.edu.cn/', '全国大学生药苑论坛'],
  132: ['https://jyt.jiangsu.gov.cn/', '江苏省师范生教学基本功大赛'],
  134: ['https://math.seu.edu.cn/', '江苏省高等数学竞赛'],
  135: ['https://51mcm.cumt.edu.cn/', '五一数学建模竞赛'],
  140: ['https://jssdxszsjs.mh.chaoxing.com/', '江苏省大学生知识竞赛'],
  141: ['https://jsip.jiangsu.gov.cn/', '江苏省大学生知识产权竞赛'],
  144: ['https://cad.seu.edu.cn/', '华东区CAD应用技能竞赛'],
  154: ['https://hgxy.ntu.edu.cn/', '南通大学化学实验基本操作技能比赛'],
  158: ['https://cxcyxy.ntu.edu.cn/', '通创荟科技创业大赛'],
  159: ['https://cxcyxy.ntu.edu.cn/', 'AI视频新创想OPC创新创业大赛'],
};

function probe(url) {
  try {
    const out = execFileSync('curl.exe', [
      '-sSL', '-x', 'http://127.0.0.1:7897',
      '-A', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126',
      '--max-time', '20', '-o', 'NUL', '-w', '%{http_code}', url,
    ], { encoding: 'utf8', timeout: 30000, windowsHide: true }).trim();
    return parseInt(out, 10) || 0;
  } catch (e) { return 0; }
}

(async () => {
  /* 1. 候选官网验证 */
  const verified = {};
  console.log('验证候选官网...');
  for (const [no, [url, label]] of Object.entries(EXTRA_CANDIDATES)) {
    const code = probe(url);
    if (code >= 200 && code < 400) { verified[no] = { url, label, type: 'official' }; console.log('  ok', no, url); }
    else console.log('  x ', no, code, url);
  }

  /* 2. 组装 */
  const LINKS = {};
  const UNITS = {};
  comps.forEach(c => {
    const key = String(c.no);
    if (verified[key]) { LINKS[key] = [verified[key].url, 'official', verified[key].label + '官网']; return; }
    if (OFFICIAL[key]) { LINKS[key] = [OFFICIAL[key], 'official', (OLD[c.no] && OLD[c.no][2]) || '官方入口']; return; }
    /* 3. 回退到承办单位官网 */
    const unit = (c.orgs || []).find(o => UNIT_SITE[o]);
    if (unit) {
      const [url, label] = UNIT_SITE[unit];
      LINKS[key] = [url, 'college', label + '（承办）'];
      UNITS[unit] = url;
    }
  });

  const out = `/* ================================================================
   综测帮 — 竞赛入口链接表（自动生成 tools/gen_links.js）
   ----------------------------------------------------------------
   type: official = 主办方/组委会官网（已核验）
         college  = 无独立官网，指向承办学院/部门官网
   核验日期: ${new Date().toISOString().slice(0, 10)}
   ================================================================ */
(function (global) {
'use strict';
global.NTU_LINKS = {\n` +
    Object.entries(LINKS).map(([no, v]) =>
      `  ${no}: [${JSON.stringify(v[0])}, ${JSON.stringify(v[1])}, ${JSON.stringify(v[2])}],`
    ).join('\n') +
    `\n};\nif (typeof module !== 'undefined') module.exports = global.NTU_LINKS;\n` +
    `})(typeof window !== 'undefined' ? window : globalThis);\n`;
  fs.writeFileSync('js/competition-links.js', out);

  const off = Object.values(LINKS).filter(v => v[1] === 'official').length;
  const col = Object.values(LINKS).filter(v => v[1] === 'college').length;
  console.log(`\n生成完成: ${Object.keys(LINKS).length}/${comps.length} 项有入口 (official=${off}, college=${col})`);
  const missing = comps.filter(c => !LINKS[String(c.no)]).map(c => c.no + ':' + c.name.slice(0, 20));
  console.log('仍无入口:', missing.length);
  missing.slice(0, 20).forEach(m => console.log('  -', m));
})();
