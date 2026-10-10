/* ================================================================
   综测帮 — 加分规则引擎
   ----------------------------------------------------------------
   依据:
   1.《南通大学学生素质综合测评办法（修订）》（通大学〔2024〕33 号）
      https://xxgk.ntu.edu.cn/2024/1111/c9157a253986/page.htm
   2.《南通大学大学生学科竞赛目录（2026年版）》（认定类别折算参考）
   3. 机械工程学院 2025-2026 综测第一次审核实测口径（参考标注）
   说明: 学院对集体项目、认定类别折算有裁量权，计算结果仅供参考。
   ================================================================ */
(function (global) {
'use strict';

/* ---------- 官方规则常量（通大学〔2024〕33号） ---------- */
var RULES = {
  /* 综测权重: 德育10% + 智育75% + 体育5% + 美育5% + 劳育5% */
  weights: { deyu: 0.10, zhiyu: 0.75, tiyu: 0.05, meiyu: 0.05, laoyu: 0.05 },

  /* 德育加减分 */
  deyu: {
    award: { national: 5, provincial: 3.5, city: 2.5, school: 1.5 }, // 受表彰
    cadre: { min: 0.5, max: 1 },   // 各级学生干部 经学院考核推荐加 0.5-1
    deduct: { liuxiao: -10, jiguo: -7, yanzhong: -5, jinggao: -3 } // 处分
  },

  /* 智育 · 学习竞赛获奖（一/二/三等奖） */
  zhiyu: {
    contest: {
      national:  [5, 4, 3],
      provincial:[2, 1.5, 1],
      city:      [1.5, 1, 0.5],
      school:    [1, 0.5, 0.2]
    },
    cet46: 1,        // 通过四/六级（≥60分）各加 1
    ncre2: 1         // 计算机二级（学院实测口径 +1，非校规原文）
  },

  /* 体育 · 竞赛名次加分表（名次1-8 → 分数，破纪录另加） */
  tiyu: {
    rank: {
      national: [5, 5, 4.5, 4, 3.5, 3.5, 3.5, 3],
      provincial:[3.5, 3.5, 3, 2.5, 2, 2, 2, 1.5],
      school:   [2.5, 2.5, 2, 1.5, 1, 1, 1, 0.5]
    },
    rankLabels: ['第一名','第二名','第三名','第四名','第五名','第六名','第七名','第八名'],
    levelLabels: { national: '国家级', provincial: '省级', school: '校（市）级' },
    athlete1: 4, athlete2: 3,          // 一级/二级运动员证书
    referee: { national: 4, g1: 3, g2: 2, g3: 1 } // 裁判员证书
  },

  /* 劳育 */
  laoyu: {
    volunteer: { baseHours: 10, perHour: 0.5, cap: 10 }, // 超10h后 N×0.5 上限10
    dormBase: 5, dormCivilized: 10, dormModel: 20       // 卫生达标/文明宿舍/标兵
  },

  /* 美育: 参与校园文化活动基础分≤60 + 奖惩分≤40（学院细则量化） */
};

/* ---------- 机械学院实测参考（2025-2026 第一次审核通过实例） ---------- */
var ME_PRACTICAL = [
  { match: /先进成图|成图大赛/, note: '实测参考：先进成图大赛国二计 +4、校三计 +0.5（Ⅰ类丁）' },
  { match: /数学建模|MCM|ICM/, note: '实测参考：美赛 MCM/ICM H 奖计 +0.5（Ⅱ类乙）；国赛获奖按级别基准' },
  { match: /智能机器人创意大赛/, note: '实测参考：智能机器人创意大赛国二计 +1、省三计 +1（团队再按 0.25-0.5 折算，就高不重复）（Ⅰ类丁）' },
  { match: /词达人|英语词汇/, note: '实测参考：词达人杯国三计 +0.5（Ⅱ类乙）' },
  { match: /英语翻译大赛/, note: '实测参考：英语翻译大赛国三 +1、省一 +2、省二 +1.5、省三 +1、优秀奖 +0.5（个人）' },
  { match: /高等数学|高数/, note: '实测参考：江苏省高等数学竞赛省三计 +1' },
  { match: /英语竞赛/, note: '注意：《竞赛目录》中"全国大学生英语竞赛"仅特等奖可加分，非特等奖不加分' },
  { match: /国际人才英语/, note: '注意：国际人才英语考试（初级）2025-2026 审核未通过，不计分' }
];

/* ---------- 工具 ---------- */
function round1(n) { return Math.round(n * 100) / 100; }

/**
 * 智育竞赛加分
 * @param level national|provincial|city|school
 * @param prize 1|2|3 (一二三等奖)；特等奖按一等奖档，优胜/参与奖 0
 */
function contestBonus(level, prize) {
  var table = RULES.zhiyu.contest[level];
  if (!table) return { score: 0, note: '级别无效' };
  if (!prize || prize < 1 || prize > 3) return { score: 0, note: '非一/二/三等奖（优胜奖、参与奖等由学院酌情）' };
  return { score: table[prize - 1], note: '' };
}

/**
 * 体育名次加分
 * @param level national|provincial|school
 * @param rank 1..8
 */
function sportRankBonus(level, rank) {
  var table = RULES.tiyu.rank[level];
  if (!table) return { score: 0, note: '级别无效' };
  if (rank < 1 || rank > 8) return { score: 0, note: '仅统计前八名' };
  return { score: table[rank - 1], note: '' };
}

/** 劳育志愿时长得分: 超10h起 (h-10)×0.5 上限10 */
function volunteerBonus(hours) {
  if (!hours || hours <= RULES.laoyu.volunteer.baseHours) return 0;
  return Math.min(round1((hours - 10) * RULES.laoyu.volunteer.perHour), RULES.laoyu.volunteer.cap);
}

/** 劳育 PU 学时得分（学院口径）: (n-10)×0.1 上限2 */
function puBonus(n) {
  if (!n || n <= 10) return 0;
  return Math.min(round1((n - 10) * 0.1), 2);
}

/**
 * 综合计算器
 * @param {Object} input
 *   category: contest|sport|cet|ncre|award|volunteer
 *   level: national|provincial|city|school
 *   prize: 1|2|3 (竞赛奖次)
 *   rank: 1..8 (体育名次)
 *   team: 团队名次成员折算 0-1 之间（默认 1，个人全计）
 *   compName: 竞赛名称（用于实测参考提示）
 */
function calculate(input) {
  var res = { score: 0, basis: [], practical: [], warn: [] };
  var cat = input.category, level = input.level;
  var r, s;

  if (cat === 'contest') {
    r = contestBonus(level, input.prize);
    s = round1(r.score * (input.team != null ? input.team : 1));
    res.score = s;
    var prizeName = ['一等奖', '二等奖', '三等奖'][input.prize - 1] || '获奖';
    var lvlName = { national: '国家级', provincial: '省级', city: '市级', school: '校级' }[level] || level;
    res.basis.push('智育·学习竞赛：' + lvlName + prizeName + ' 基准 +' + r.score + ' 分（通大学〔2024〕33号 智育加减分第(1)条）');
    if (r.note) res.warn.push(r.note);
    if (input.team != null && input.team < 1) res.basis.push('团队获奖成员按学院酌情折算 ×' + input.team);
  } else if (cat === 'sport') {
    r = sportRankBonus(level, input.rank);
    res.score = round1(r.score * (input.team != null ? input.team : 1));
    res.basis.push('体育·竞赛名次：' + RULES.tiyu.levelLabels[level] + RULES.tiyu.rankLabels[input.rank - 1] + ' +' + r.score + ' 分（体育加减分名次表）');
    if (r.note) res.warn.push(r.note);
  } else if (cat === 'cet') {
    res.score = RULES.zhiyu.cet46;
    res.basis.push('智育：通过全国大学英语四/六级（百分制≥60）+1 分（首次）');
  } else if (cat === 'ncre') {
    res.score = RULES.zhiyu.ncre2;
    res.basis.push('智育：首次通过全国计算机等级考试二级 +1 分（机械学院 2025-2026 实测口径）');
  } else if (cat === 'award') {
    var award = RULES.deyu.award[level];
    res.score = award * (input.team != null ? input.team : 1);
    var an = { national: '国家级', provincial: '省级', city: '市级', school: '校级' }[level];
    res.basis.push('德育：受' + an + '表彰 +' + award + ' 分；集体表彰成员由学院酌情折算');
  } else if (cat === 'volunteer') {
    res.score = volunteerBonus(input.hours);
    res.basis.push('劳育：志愿汇时长超 10h 后 N×0.5 计分，上限 10 分');
    if (res.score >= RULES.laoyu.volunteer.cap) res.warn.push('已达 10 分上限');
  } else if (cat === 'pu') {
    res.score = puBonus(input.pu);
    res.basis.push('劳育：PU 学时超 10 分后 N×0.1 计分，上限 2 分（学院口径）');
  } else {
    res.warn.push('请选择加分类型');
  }

  /* 竞赛实测参考提示 */
  if (input.compName) {
    ME_PRACTICAL.forEach(function (p) {
      if (p.match.test(input.compName)) res.practical.push(p.note);
    });
  }

  res.warn.push('最终以学院综测小组审核公示为准；集体项目、认定类别折算由学院酌情裁量。');
  return res;
}

/* ---------- 导出 ---------- */
global.ZONGCE_RULES = {
  RULES: RULES,
  calculate: calculate,
  contestBonus: contestBonus,
  sportRankBonus: sportRankBonus,
  volunteerBonus: volunteerBonus,
  puBonus: puBonus
};
if (typeof module !== 'undefined') module.exports = global.ZONGCE_RULES;
})(typeof window !== 'undefined' ? window : globalThis);
