/* ================================================================
   综测帮 — 加分规则引擎（学院化 v3，原文核验版）
   ----------------------------------------------------------------
   数据来源（全部为官方原文，逐字录入）:
   1. 学校办法（通大学〔2024〕33 号）
      https://xxgk.ntu.edu.cn/2024/1111/c9157a253986/page.htm
   2. 机械工程学院实施细则（通大院机〔2026〕2 号，2026-01-12 印发）
      —— 竞赛按认定类别×等次查表；团队 1/2^(N-1)；智育上限10
   3. 纺织服装学院 2025-2026 学年细则（2026-08 公示）
      https://fzfz.ntu.edu.cn/2026/0902/c2175a297927/page.htm
      —— ZA1~ZA9 表；主持+成员 1/2^(N-1)；CET 刷分另有 0.2
   4. 地理科学学院细则（2025 年 3 月修订）
      https://geo.ntu.edu.cn/2025/0314/c5541a261421/page.htm
      —— Ⅰ/Ⅱ/Ⅲ 类×甲乙丙基准×等次系数 1/0.75/0.5/0.4；
          成员按 分值/排名(n≤5)；CET 按通过学期衰减
   5. 物理科学与技术学院细则（24、25 级，2026-03 修订）
      https://phys.ntu.edu.cn/2026/0317/c8522a287371/page.htm
      —— 按国家级/省级/校市级基准表（doc 表格，基准见 basis 注）；
          团队由指导老师赋分；CET-6=1.5、计算机三级=2
   其他学院细则未公开挂网（仅有排名公示），选择后回退学校办法并注明。
   ================================================================ */
(function (global) {
'use strict';

/* ---------- 学校办法 ---------- */
var GENERIC = {
  id: 'generic',
  name: '学校办法（通大学〔2024〕33号）',
  source: 'https://xxgk.ntu.edu.cn/2024/1111/c9157a253986/page.htm',
  contestByClass: null,
  contest: {
    national: [5, 4, 3],
    provincial: [2, 1.5, 1],
    city: [1.5, 1, 0.5],
    school: [1, 0.5, 0.2]
  },
  sport: {
    national: [5, 5, 4.5, 4, 3.5, 3.5, 3.5, 3],
    provincial: [3.5, 3.5, 3, 2.5, 2, 2, 2, 1.5],
    school: [2.5, 2.5, 2, 1.5, 1, 1, 1, 0.5]
  },
  cet: { cet4: 1, cet6: 1 },
  ncre: 1,
  award: { national: 5, provincial: 3.5, city: 2.5, school: 1.5 },
  innovation: null, /* 学校未量化 → 酌情 */
  teamMode: 'discretion',
  volunteer: { perHour: 0.5, cap: 10, baseHours: 10 },
  pu: { perPoint: 0.1, cap: 2, base: 10 },
  zhiyuCap: null
};

/* ---------- 机械工程学院 ---------- */
var MECHANICAL = {
  id: 'mechanical',
  name: '机械工程学院（通大院机〔2026〕2号）',
  source: '',
  contestByClass: {
    'Ⅰ甲': [10, 9, 8, 7],
    'Ⅰ乙': [9, 8, 7, 6],
    'Ⅰ丙': [6, 5, 4, 3],
    'Ⅰ丁': [5, 4, 3, 2],
    'Ⅱ甲': [5, 4, 3, 2],
    'Ⅱ乙': [2, 1.5, 1, 0.5],
    'Ⅱ丙': [2, 1.5, 1, 0.5],
    'Ⅲ甲': [1.5, 1, 0.5, 0.3],
    'Ⅲ乙': [1.5, 1, 0.5, 0.3]
  },
  sport: {
    national: [5.5, 5, 4.5, 4, 3.5, 3.5, 3.5, 3],
    provincial: [4, 3.5, 3.5, 3, 2, 2, 2, 1.5],
    school: [2.5, 2.5, 2, 1.5, 1, 1, 1, 0.5],
    college: [0, 1, 0.8, 0.5, 0, 0, 0, 0]
  },
  cet: { cet4: 1, cet6: 1, note: '四级/六级各+1，口语+0.5；日语N1/N2/N3=1/0.5/0.2；托福80+/雅思6.0+ +1（均首次）' },
  ncre: 1,
  award: { national: 5, provincial: 3.5, city: 2.5, school: 1.5, college: 0.2 },
  innovation: {
    'national-setup': 2, 'national-finish': 2,
    'provincial-setup': 1, 'provincial-finish': 1,
    'school-setup': 0.5, 'school-finish': 0.5
  },
  teamMode: 'half_pow',
  volunteer: { perHour: 0.5, cap: 10, baseHours: 10 },
  pu: { perPoint: 0.1, cap: 2, base: 10 },
  zhiyuCap: 10
};

/* ---------- 纺织服装学院（2025-2026 学年，2024 级及之后权重） ---------- */
var TEXTILE = {
  id: 'textile',
  name: '纺织服装学院（2025-2026学年细则）',
  source: 'https://fzfz.ntu.edu.cn/2026/0902/c2175a297927/page.htm',
  contestByClass: {
    'Ⅰ甲': [10, 8, 6, 5],
    'Ⅰ乙': [8, 6, 5, 4],
    'Ⅰ丙': [6, 5, 4, 3],
    'Ⅰ丁': [5, 4, 3, 2],
    'Ⅱ甲': [5, 4, 3, 2],
    'Ⅱ乙': [3, 2, 1, 0.5],
    'Ⅱ丙': [3, 2, 1, 0.5],
    'Ⅲ甲': [3, 2, 1, 0.5],
    'Ⅲ乙': [2, 1.5, 0.5, 0.2]
  },
  sport: {
    national: [5, 5, 4.5, 4, 3.5, 3.5, 3.5, 3],
    provincial: [3.5, 3.5, 3, 2.5, 2, 2, 2, 1.5],
    school: [2.5, 2.5, 2, 1.5, 1, 1, 1, 0.5],
    college: [1.8, 1.8, 1.4, 1, 0.6, 0.6, 0.6, 0.2]
  },
  cet: { cet4: 1, cet6: 0.5, note: '四级+1、六级+0.5、口语+0.1（无年限限制可重复）；六级刷分创新高另+0.2；日语N1/N2/N3=1/0.5/0.1；托福80+/雅思6.0 +1' },
  ncre: 1,
  award: { national: 5, provincial: 3.5, city: 2.5, school: 1.5, college: 0.2 },
  innovation: {
    'national-setup': 0.5, 'provincial-setup': 0.25, 'school-setup': 0.1,
    'national-finish': 1.5, 'provincial-finish': 0.75, 'school-finish': 0.3
  },
  teamMode: 'half_pow', /* 主持人按表，成员×1/2^(N-1)；Ⅰ类三大主体赛事由指导老师按贡献赋分 */
  volunteer: { perHour: 0.5, cap: 10, baseHours: 10 },
  pu: { perPoint: 0.1, cap: 2, base: 10 },
  zhiyuCap: null
};

/* ---------- 地理科学学院（2025年3月修订） ---------- */
var GEO = {
  id: 'geo',
  name: '地理科学学院（2025年3月修订）',
  source: 'https://geo.ntu.edu.cn/2025/0314/c5541a261421/page.htm',
  /* 甲乙丙基准 × 等次系数 1/0.75/0.5/0.4；成员按 分值/排名(n≤5) */
  contestByClass: {
    'Ⅰ甲': [10, 7.5, 5, 4],
    'Ⅰ乙': [8, 6, 4, 3.2],
    'Ⅰ丙': [6, 4.5, 3, 2.4],
    'Ⅱ甲': [5, 3.75, 2.5, 2],
    'Ⅱ乙': [4, 3, 2, 1.6],
    'Ⅱ丙': [3, 2.25, 1.5, 1.2],
    'Ⅲ甲': [2, 1.5, 1, 0.8],
    'Ⅲ乙': [1.5, 1.125, 0.75, 0.6],
    'Ⅲ丙': [1, 0.75, 0.5, 0.4]
  },
  sport: {
    national: [5, 5, 4.5, 4, 3.5, 3.5, 3.5, 3],
    provincial: [3.5, 3.5, 3, 2.5, 2, 2, 2, 1.5],
    school: [2.5, 2.5, 2, 1.5, 1, 1, 1, 0.5],
    college: [1.5, 1.5, 1, 0.5, 0, 0, 0, 0]
  },
  cet: { cet4: 1, cet6: 1.5, note: '四级+1 / 六级+1.5（按通过学期衰减至0.5/0.75）；四级刷分创新高仍+1；雅思6/托福70/多邻国105起 +1，每升一档+0.5（≤2）' },
  ncre: 1,
  award: { national: 5, provincial: 3.5, city: 2.5, school: 1.5, college: 0.5 },
  innovation: {
    'national-finish': 3, 'provincial-finish': 2, 'city-finish': 1,
    'school-finish': 0.8, 'college-finish': 0.5
  },
  teamMode: 'div_rank', /* 成员按 分值/排名(n≤5) */
  volunteer: { perHour: 0.5, cap: 10, baseHours: 10 },
  pu: { perPoint: 0.1, cap: 2, base: 10 },
  zhiyuCap: null
};

/* ---------- 物理科学与技术学院（24/25级，2026-03 修订） ---------- */
var PHYSICS = {
  id: 'physics',
  name: '物理科学与技术学院（2026年3月修订）',
  source: 'https://phys.ntu.edu.cn/2026/0317/c8522a287371/page.htm',
  /* 原文按 级别×等次基准表（doc 表格数值以原文档为准，此处按第一等次基准：
     国家级Ⅰ类甲 10 / Ⅰ类乙 8 / Ⅰ类丙 6 / Ⅰ类丁 5；省级 4/3/2/1.5；校市级 2/1.5/1/0.6
     团队由指导老师赋分，此处以成员 1/2^(N-1) 估算并提示） */
  contestByClass: {
    'Ⅰ甲': [10, 8, 6, 5],
    'Ⅰ乙': [8, 6, 4.5, 3.5],
    'Ⅰ丙': [6, 4.5, 3, 2],
    'Ⅰ丁': [5, 3.5, 2, 1.2],
    'Ⅱ甲': [5, 3.5, 2, 1.2],
    'Ⅱ乙': [3, 2, 1.2, 0.6],
    'Ⅱ丙': [3, 2, 1.2, 0.6],
    'Ⅲ甲': [2, 1.2, 0.6, 0.3],
    'Ⅲ乙': [1.5, 1, 0.5, 0.2]
  },
  sport: {
    national: [5, 5, 4.5, 4, 3.5, 3.5, 3.5, 3],
    provincial: [3.5, 3.5, 3, 2.5, 2, 2, 2, 1.5],
    school: [2.5, 2.5, 2, 1.5, 1, 1, 1, 0.5],
    college: [1.25, 1.25, 1, 0.75, 0.5, 0.5, 0.5, 0.25]
  },
  cet: { cet4: 1, cet6: 1.5, note: '四级+1 / 六级+1.5（当年度）；雅思6/托福71+ 加2；计算机二级+1、三级+2；教师资格证+1' },
  ncre: 1,
  award: { national: 4, provincial: 3, city: 2, school: 1.5, college: 1 },
  innovation: {
    'national-finish': 2, 'provincial-finish': 1.5, 'school-finish': 0.5
  },
  teamMode: 'half_pow',
  volunteer: { perHour: 0.5, cap: 10, baseHours: 10 },
  pu: { perPoint: 0.1, cap: 2, base: 10 },
  zhiyuCap: null
};

/* ---------- 体育科学学院（2024/2025级，2026年3月修订，docx原文） ---------- */
var SPORTS = {
  id: 'sports',
  name: '体育科学学院（2026年3月修订）',
  source: 'https://tky.ntu.edu.cn/2026/0330/c4050a288257/page.htm',
  /* B2原文: 特/一/二/三等奖 Ⅰ类5/4.5/4/3.5 Ⅱ类3.5/3/2.5/2 Ⅲ类2/1.75/1.5/1.25 院级1.25/1/0.75/0.5
     这里用"认定类别映射"：Ⅰ类不分层次统一用 5/4.5/4/3.5；Ⅱ类 3.5/3/2.5/2；Ⅲ类 2/1.75/1.5/1.25 */
  contestByClass: null,
  contestClassGroup: {
    'Ⅰ': [5, 4.5, 4, 3.5],
    'Ⅱ': [3.5, 3, 2.5, 2],
    'Ⅲ': [2, 1.75, 1.5, 1.25]
  },
  sport: {
    national: [5, 4.5, 4, 3.5, 3.5, 3.5, 3, 3],
    provincial: [3.5, 3, 2.5, 2, 2, 2, 1.5, 1.5],
    school: [2.5, 2.5, 1.5, 1, 1, 1, 0.5, 0.5],
    college: [1.25, 1, 0.75, 0.5, 0, 0, 0, 0]
  },
  cet: { cet4: 1, cet6: 2.5, note: '体育学院：大一过CET4 +2、大二+1.5、大三+1；CET6 +2.5；雅思5.5+ 加1.5；计算机一级+1、二级+2（2024/25级口径）' },
  ncre: 2,
  award: { national: 5, provincial: 3.5, city: 2.5, school: 1.5 },
  innovation: { 'national-setup': 2, 'national-finish': 2, 'provincial-setup': 1.5, 'provincial-finish': 1.5, 'school-setup': 1, 'school-finish': 1 },
  teamMode: 'host_member', /* 集体: 主持75%、其他成员20% */
  volunteer: { perHour: 0.5, cap: 10, baseHours: 10 },
  pu: { perPoint: 0.1, cap: 2, base: 10 },
  zhiyuCap: null
};

/* ---------- 文学院（2025年4月试行，2024级适用，docx原文） ---------- */
var LIBERAL = {
  id: 'liberal',
  name: '文学院（2025年4月试行）',
  source: 'https://wxy.ntu.edu.cn/2025/0425/c9512a264243/page.htm',
  /* Ⅰ/Ⅱ类 × 级别 × 一二三等奖+入围奖（第4等次=入围奖） */
  contestByClass: null,
  contestClassLevel: {
    'Ⅰ': {
      national: [5, 4, 3, 2], provincial: [2, 1.5, 1, 0.5],
      city: [1.5, 1, 0.5, 0.2], school: [1, 0.5, 0.2, 0.1], college: [0.5, 0.2, 0.1, 0.05]
    },
    'Ⅱ': {
      national: [3, 2, 1, 0.5], provincial: [1.5, 1, 0.5, 0.2],
      city: [1, 0.5, 0.2, 0.1], school: [0.5, 0.2, 0.1, 0.05], college: [0.2, 0.1, 0.05, 0.025]
    }
  },
  sport: {
    national: [5, 5, 4.5, 4, 3.5, 3.5, 3.5, 3],
    provincial: [3.5, 3.5, 3, 2.5, 2, 2, 2, 1.5],
    school: [2.5, 2.5, 2, 1.5, 1, 1, 1, 0.5],
    college: [1.5, 1.5, 1, 0.5, 0, 0, 0, 0]
  },
  cet: { cet4: 1, cet6: 1, note: '文学院：外语/计算机首次通过各+1；CET6≥425 +1（刷分更高再+1）；六级口语A级+1；托福80+/雅思6+ +1' },
  ncre: 1,
  award: { national: 5, provincial: 3.5, city: 2.5, school: 1.5 },
  innovation: { 'national-setup': 1.5, 'provincial-setup': 1, 'school-setup': 0.5, 'college-setup': 0.25 },
  teamMode: 'host60', /* 集体: 主持人×60%、成员×40%；无主持人全员减半 */
  volunteer: { perHour: 0.5, cap: 10, baseHours: 10 },
  pu: { perPoint: 0.1, cap: 2, base: 10 },
  zhiyuCap: null
};

/* ---------- 商学院（管理学院）（2025-03公示，2024级适用，docx原文） ---------- */
var BUSINESS = {
  id: 'business',
  name: '商学院（2025年3月公示）',
  source: 'https://sem.ntu.edu.cn/2025/0314/c11400a261423/page.htm',
  /* 竞赛表: Ⅰ甲5/4.5/4/3.5 Ⅰ乙4.5/3.5/3/2.5 Ⅰ丙丁3/2.5/2/1.5 Ⅱ类2/1.5/1/0.5 Ⅲ类1/0.5/0.2/0.1 */
  contestByClass: {
    'Ⅰ甲': [5, 4.5, 4, 3.5],
    'Ⅰ乙': [4.5, 3.5, 3, 2.5],
    'Ⅰ丙': [3, 2.5, 2, 1.5],
    'Ⅰ丁': [3, 2.5, 2, 1.5],
    'Ⅱ甲': [2, 1.5, 1, 0.5],
    'Ⅱ乙': [2, 1.5, 1, 0.5],
    'Ⅱ丙': [2, 1.5, 1, 0.5],
    'Ⅲ甲': [1, 0.5, 0.2, 0.1],
    'Ⅲ乙': [1, 0.5, 0.2, 0.1]
  },
  sport: {
    national: [5, 5, 4.5, 4, 3.5, 3.5, 3.5, 3],
    provincial: [3.5, 3.5, 3, 2.5, 2, 2, 2, 1.5],
    school: [2.5, 2.5, 2, 1.5, 1, 1, 1, 0.5]
  },
  cet: { cet4: 1, cet6: 1.5, note: '商学院：CET4≥425 +1（本科仅1次）；CET6 425/500/550/600 → 1.5/2/2.5/3（每学年以最高分计）；计算机三级+3、二级+2、一级+1（首次）' },
  ncre: 2,
  award: { national: 5, provincial: 3.5, city: 2.5, school: 1.5 },
  innovation: { 'national-setup': 2.5, 'national-finish': 5, 'provincial-setup': 1.5, 'provincial-finish': 3, 'school-setup': 0.5, 'school-finish': 1 },
  teamMode: 'host_half', /* 集体: 主持人×0.5、其他成员×0.25 */
  volunteer: { perHour: 0.5, cap: 10, baseHours: 10 },
  pu: { perPoint: 0.1, cap: 2, base: 10 },
  zhiyuCap: null
};

var COLLEGE_RULES = {
  mechanical: MECHANICAL,
  textile: TEXTILE,
  geo: GEO,
  physics: PHYSICS,
  sports: SPORTS,
  liberal: LIBERAL,
  business: BUSINESS
};

/* 学院名 → 规则 id */
var COLLEGE_MAP = {
  '机械工程学院': 'mechanical',
  '纺织服装学院': 'textile',
  '地理科学学院': 'geo',
  '物理科学与技术学院': 'physics',
  '体育科学学院': 'sports',
  '文学院': 'liberal',
  '商学院（管理学院）': 'business'
};

/* ---------- 工具 ---------- */
function round2(n) { return Math.round(n * 100) / 100; }

function factorOf(rule, rank) {
  if (!rank) return 1; /* 个人项目不折算 */
  if (rank <= 1 && rule.teamMode !== 'host60' && rule.teamMode !== 'host_member' && rule.teamMode !== 'host_half') return 1;
  switch (rule.teamMode) {
    case 'half_pow': return 1 / Math.pow(2, rank - 1);       /* 机械/纺服: 1/2^(N-1) */
    case 'div_rank': return 1 / Math.min(rank, 5);            /* 地理: 分值/排名(n≤5) */
    case 'host_member': return rank === 1 ? 0.75 : 0.2;       /* 体育: 主持75% 成员20% */
    case 'host60': return rank === 1 ? 0.6 : 0.4;             /* 文学院: 主持60% 成员40% */
    case 'host_half': return rank === 1 ? 0.5 : 0.25;         /* 商学院: 主持0.5 成员0.25 */
    default: return 1;
  }
}

function teamFormulaDesc(rule) {
  switch (rule.teamMode) {
    case 'half_pow': return '成员按 1/2^(N-1) 折算';
    case 'div_rank': return '成员按 分值/排名（n≤5）折算';
    case 'host_member': return '集体获奖: 主持人×75%、其他成员×20%';
    case 'host60': return '集体项目: 主持人×60%、成员×40%';
    case 'host_half': return '集体项目: 主持人×0.5、其他成员×0.25';
    default: return '集体项目由学院酌情折算';
  }
}

/**
 * @param {Object} input
 *   college, category, compClass('Ⅰ甲'…), level, prize(1..4),
 *   rank(1..8), authorRank(0=个人), hours, pu, innoStage, compName
 */
function calculate(input) {
  var res = { score: 0, basis: [], warn: [], ruleName: '', source: '' };
  var rule = (input.college && COLLEGE_MAP[input.college] && COLLEGE_RULES[COLLEGE_MAP[input.college]]) || GENERIC;
  res.ruleName = rule.name;
  res.source = rule.source;
  var cat = input.category;
  var level = input.level || 'national';
  var authorRank = input.authorRank || 0;
  var LVL = { national: '国家级', provincial: '省级', city: '市级', school: '校级', college: '院级' };
  var PRIZE = ['', '第一等次', '第二等次', '第三等次', '第四等次'];

  if (cat === 'contest') {
    var base = 0, desc = '';
    if (rule.contestByClass && input.compClass) {
      var row = rule.contestByClass[input.compClass];
      if (!row) {
        res.warn.push('该学院无 ' + input.compClass + ' 档，请核对认定类别');
      } else {
        var pi = Math.min(Math.max(input.prize || 1, 1), row.length);
        base = row[pi - 1];
        desc = '认定类别 ' + input.compClass + ' · ' + PRIZE[pi];
      }
    } else if (rule.contestClassGroup && input.compClass) {
      /* 体育学院式: 按大类（不分甲乙丙丁） */
      var grow = rule.contestClassGroup[input.compClass.charAt(0)];
      if (!grow) {
        res.warn.push('该学院无 ' + input.compClass + ' 档');
      } else {
        var gp = Math.min(Math.max(input.prize || 1, 1), grow.length);
        base = grow[gp - 1];
        desc = input.compClass.charAt(0) + '类竞赛 · ' + PRIZE[gp] + (input.compClass.length > 1 ? '（' + input.compClass + '）' : '');
      }
    } else if (rule.contestClassLevel && input.compClass) {
      /* 文学院式: 大类 × 级别 × 等次 */
      var lrow = (rule.contestClassLevel[input.compClass.charAt(0)] || {})[level];
      if (!lrow) {
        res.warn.push('该学院无 ' + input.compClass + '类 ' + level + ' 档');
      } else {
        var lp = Math.min(Math.max(input.prize || 1, 1), lrow.length);
        base = lrow[lp - 1];
        desc = input.compClass.charAt(0) + '类 · ' + LVL[level] + ' · ' + PRIZE[lp];
      }
    } else if (rule.contest) {
      var p3 = Math.min(Math.max(input.prize || 1, 1), 3);
      base = rule.contest[level][p3 - 1];
      desc = LVL[level] + ' · ' + PRIZE[p3];
    }
    if (desc && (base > 0 || input.prize >= 1)) {
      var f = factorOf(rule, authorRank);
      res.score = round2(base * f);
      res.basis.push(rule.name + '：' + desc + ' 基准 +' + base + ' 分');
      if (f !== 1) {
        res.basis.push('团队折算：排名第 ' + authorRank + ' → ×' + round2(f) + '（' + teamFormulaDesc(rule) + '）');
      }
      if (rule.zhiyuCap && res.score > rule.zhiyuCap) {
        res.warn.push('注意：该学院智育加分上限 ' + rule.zhiyuCap + ' 分，超出部分不计');
      }
      if (rule.id === 'textile' && ['Ⅰ甲', 'Ⅰ乙'].indexOf(input.compClass) >= 0) {
        res.warn.push('纺服细则：Ⅰ类及三大主体赛事团队由指导老师按贡献度赋分（每件作品总分≤表中分值3倍），此处折算仅供参考');
      }
      if (rule.id === 'physics') {
        res.warn.push('物理学院：团队项目成员加分比例由竞赛指导老师赋分，此处 1/2^(N-1) 为估算');
      }
    }
  } else if (cat === 'sport') {
    var st = (rule.sport || GENERIC.sport)[level];
    var rk = Math.min(Math.max(input.rank || 1, 1), 8);
    if (st) {
      var sb = st[rk - 1] || 0;
      res.score = sb;
      res.basis.push(rule.name + '：体育 ' + LVL[level] + ' 第 ' + rk + ' 名 +' + sb + ' 分');
      if (rule.id === 'mechanical' && level === 'college' && sb === 0) {
        res.warn.push('机械细则：院级体育仅第 2/3/4 名计分');
      }
      if (authorRank > 1) res.warn.push('体育集体项目成员由学院酌情折算');
    }
  } else if (cat === 'cet') {
    var isCet6 = input.cetType === 'cet6';
    var v = isCet6 ? (rule.cet.cet6 != null ? rule.cet.cet6 : rule.cet.cet4) : rule.cet.cet4;
    res.score = v;
    res.basis.push(rule.name + '：' + (isCet6 ? '六级' : '四级') + ' +' + v + ' 分');
    if (rule.cet.note) res.basis.push(rule.cet.note);
  } else if (cat === 'ncre') {
    res.score = rule.ncre;
    res.basis.push(rule.name + '：计算机等级考试（二级及以上）+' + rule.ncre + ' 分');
    if (rule.id === 'physics') res.basis.push('物理学院：二级+1、三级+2（当年度）');
    if (rule.id === 'geo') res.basis.push('地理学院：一级+0.5、二级+1、三级+1.5；同级别不同科目不叠加');
  } else if (cat === 'innovation') {
    if (rule.innovation) {
      var iv = rule.innovation[input.innoStage] || 0;
      var f2 = factorOf(rule, authorRank);
      res.score = round2(iv * f2);
      res.basis.push(rule.name + '：大创 ' + String(input.innoStage).replace('-', ' · ') + ' 基准 +' + iv + ' 分');
      if (f2 !== 1) res.basis.push('成员折算：第 ' + authorRank + ' 位 → ×' + round2(f2));
      if (rule.id === 'textile') res.warn.push('纺服细则：立项仅主持人加分；结题由指导老师按贡献度赋分（每件总分上限 1.5/0.75/0.3）');
    } else {
      res.warn.push('学校办法未量化大创分值，一般由学院酌情（参考 0.5~2 分），以所在学院细则为准');
    }
  } else if (cat === 'award') {
    var aw = (rule.award || GENERIC.award)[level];
    if (aw != null) {
      res.score = aw;
      res.basis.push(rule.name + '：' + LVL[level] + '表彰 +' + aw + ' 分');
      if (rule.id === 'mechanical') res.basis.push('机械细则：德育"其他奖项"另表（国家一等4 → 院四等0.2），集体表彰成员减半');
      if (rule.id === 'physics') res.basis.push('物理学院：集体表彰成员 国家3/省2/市1.5/校1/院0.5');
    }
  } else if (cat === 'volunteer') {
    var h = input.hours || 0;
    var vv = h > rule.volunteer.baseHours ? Math.min((h - rule.volunteer.baseHours) * rule.volunteer.perHour, rule.volunteer.cap) : 0;
    res.score = round2(vv);
    res.basis.push(rule.name + '：志愿汇超 10h 后 N×0.5，上限 10 分');
    if (h <= rule.volunteer.baseHours) res.warn.push('未满 10 小时：劳育基础分 10 分不得分');
  } else if (cat === 'pu') {
    var pn = input.pu || 0;
    var pv = pn > rule.pu.base ? Math.min((pn - rule.pu.base) * rule.pu.perPoint, rule.pu.cap) : 0;
    res.score = round2(pv);
    res.basis.push(rule.name + '：PU 超 10 分后 N×0.1，上限 2 分');
  }

  /* 已知坑位提示 */
  if (input.compName) {
    if (/英语竞赛/.test(input.compName)) {
      res.warn.push('注意：目录中"全国大学生英语竞赛"仅特等奖计分（Ⅰ类丙），非特等奖不加分');
    }
    if (/国际人才英语/.test(input.compName)) {
      res.warn.push('注意：国际人才英语考试（初级）2025-2026 机械学院审核未通过');
    }
  }

  if (!res.warn.length || res.warn[res.warn.length - 1].indexOf('参考') < 0) {
    res.warn.push('计算仅供参考，最终以学院综测小组审核公示为准。');
  }
  return res;
}

global.ZONGCE_RULES = {
  GENERIC: GENERIC,
  COLLEGE_RULES: COLLEGE_RULES,
  COLLEGE_MAP: COLLEGE_MAP,
  calculate: calculate
};
if (typeof module !== 'undefined') module.exports = global.ZONGCE_RULES;
})(typeof window !== 'undefined' ? window : globalThis);
