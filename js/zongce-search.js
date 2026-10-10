/* ================================================================
   综测帮 — 竞赛模糊联想搜索
   支持三种匹配: 汉字子串 / 全拼 / 拼音首字母，带高亮与相关度排序
   ================================================================ */
(function (global) {
'use strict';

/* ---------- 极简拼音字典（竞赛常用字） ---------- */
var PY = {
  '中':'zhong','国':'guo','国':'guo','际':'ji','大':'da','学':'xue','生':'sheng','创':'chuang',
  '新':'xin','赛':'sai','挑':'tiao','战':'zhan','杯':'bei','全':'quan','课':'ke','外':'wai',
  '术':'shu','科':'ke','技':'ji','作':'zuo','品':'pin','竞':'jing','业':'ye','计':'ji',
  '划':'hua','数':'shu','理':'li','建':'jian','模':'mo','医':'yi','疗':'liao','职':'zhi',
  '程':'cheng','电':'dian','子':'zi','能':'neng','源':'yuan','节':'jie','减':'jian','排':'pai',
  '工':'gong','实':'shi','践':'jian','机':'ji','械':'xie','广':'guang','告':'gao','物':'wu',
  '流':'liu','商':'shang','电':'dian','商':'shang','结':'jie','构':'gou','外':'wai','语':'yu',
  '能':'neng','力':'li','大':'da','经':'jing','典':'dian','诵':'song','写':'xie','讲':'jiang',
  '音':'yin','乐':'yue','美':'mei','术':'shu','基':'ji','本':'ben','功':'gong','物':'wu',
  '命':'ming','科':'ke','学':'xue','集':'ji','成':'cheng','电':'dian','路':'lu','机':'ji',
  '器':'qi','人':'ren','统':'tong','建':'jian','模':'mo','光':'guang','算':'suan','法':'fa',
  '金':'jin','融':'rong','财':'cai','会':'hui','税':'shui','市':'shi','场':'chang','调':'diao',
  '查':'cha','营':'ying','销':'xiao','沙':'sha','盘':'pan','企':'qi','决':'jue','策':'ce',
  '英':'ying','语':'yu','演':'yan','讲':'jiang','辩':'bian','论':'lun','跨':'kua','文':'wen',
  '化':'hua','词':'ci','达':'da','翻':'fan','译':'yi','作':'zuo','文':'wen','化':'hua',
  '高':'gao','分':'fen','子':'zi','材':'cai','料':'liao','嵌':'qian','入':'ru','芯':'xin',
  '片':'pian','百':'bai','度':'du','码':'ma','蹄':'ti','服':'fu','务':'wu','包':'bao',
  '计':'ji','算':'suan','设':'she','计':'ji','三':'san','维':'wei','先':'xian','进':'jin',
  '图':'tu','金':'jin','相':'xiang','智':'zhi','造':'zao','挑':'tiao','西门':'ximen',
  '田':'tian','家':'jia','炳':'bing','信':'xin','息':'xi','素':'su','养':'yang','美':'mei',
  '国':'guo','五':'wu','一':'yi','数':'shu','学':'xue','建':'jian','模':'mo','苏':'su',
  '省':'sheng','化':'hua','节':'jie','能':'neng','减':'jian','排':'pai','讲':'jiang',
  '思':'si','政':'zheng','绘':'hui','测':'ce','绘':'hui','地':'di','理':'li','GIS':'gis',
  '交':'jiao','通':'tong','土':'tu','木':'mu','BIM':'bim','斯':'si','维':'wei','尔':'er',
  '药':'yao','药':'yao','解':'jie','剖':'pou','形':'xing','态':'tai','微':'wei','生':'sheng',
  '物':'wu','染':'ran','整':'zheng','纺':'fang','织':'zhi','服':'fu','装':'zhuang',
  '蓝':'lan','桥':'qiao','嵌':'qian','入':'ru','体':'ti','田':'tian','径':'jing',
  '游':'you','泳':'yong','武':'wu','术':'shu','击':'ji','剑':'jian','乒':'ping','乓':'pang',
  '球':'qiu','羽':'yu','毛':'mao','足':'zu','篮':'lan','排':'pai','沙':'sha','滩':'tan',
  '龙':'long','狮':'shi','体':'ti','育':'yu','田':'tian','径':'jing','体':'ti','质':'zhi',
  '健':'jian','康':'kang','护':'hu','理':'li','康':'kang','复':'fu','公':'gong','卫':'wei'
};

/* 常见竞赛名 → 手工拼音/别名（保证高频竞赛的联想准确） */
var ALIAS = {
  '全国大学生数学建模竞赛': ['数学建模', '国赛', '数模', 'shuxuejianmo', 'sxjm'],
  '美国大学生数学建模竞赛（MCM/ICM）': ['美赛', 'mcm', 'icm', 'meisai'],
  '全国大学生先进成图技术与产品信息建模创新大赛': ['成图', 'ct', 'chengtu', '先进成图'],
  '全国大学生机械创新设计大赛': ['机创', 'jcx', '机械创新', 'jichuangxin'],
  '中国高校智能机器人创意大赛': ['机器人', '智能机器人', 'jiqiren'],
  '“挑战杯”全国大学生课外学术科技作品竞赛': ['挑战杯', 'tiaozhan', '大挑'],
  '“挑战杯”中国大学生创业计划竞赛': ['挑战杯创业', '小挑', '创业计划'],
  '中国国际大学生创新大赛': ['互联网+', '互联网加', '创新大赛', '国创赛'],
  '全国大学生电子设计竞赛': ['电赛', '电子设计', 'dianzi'],
  '全国大学生工程训练综合能力竞赛': ['工训', '工程训练'],
  '中国大学生工程实践与创新能力大赛': ['工创赛', '工程实践'],
  '“西门子杯”中国智能制造挑战赛': ['西门子', '智能制造挑战', 'xms'],
  '全国三维数字化创新设计大赛': ['3D大赛', '三维数字化', 'sanwei'],
  '全国大学生金相技能大赛（“徕卡杯”全国大学生金相技能大赛、“永新杯”全国大学生金相大会、全国大学生材料分析大赛）': ['金相', 'jinx', '徕卡杯'],
  '蓝桥杯全国大学生软件和信息技术大赛': ['蓝桥杯', 'lanqiao', '蓝桥'],
  'ACM-ICPC国际大学生程序设计竞赛': ['ACM', 'icpc', '程序设计'],
  '中国大学生计算机设计大赛': ['计算机设计', '4C', '计设'],
  '中国高校计算机大赛（大数据挑战赛、团体程序设计天梯赛、移动应用创新赛、网络技术挑战赛、人工智能创意赛）': ['天梯赛', '团体程序设计', 'C4'],
  '全国大学生英语竞赛（仅限特等奖）': ['英语竞赛', 'NECCS', '大学生英语'],
  '全国大学生市场调查与分析大赛': ['市调', '市场调查'],
  '全国大学生节能减排社会实践与科技竞赛': ['节能减排', 'jnjp'],
  '全国大学生电子商务“创新、创意及创业”挑战赛': ['三创赛', 'sanchuang', '电子商务'],
  '“外研社·国才杯”全国大学生英语辩论赛': ['外研社', '英语辩论'],
  '“外教社·词达人杯”全国大学生英语词汇能力大赛': ['词达人', 'cidaren'],
  '全国大学生英语翻译、作文大赛': ['英语翻译', '翻译大赛'],
  '“高教社杯”江苏省高等学校高等数学竞赛': null, /* 别名在动态 alias 处理 */
  '江苏省高等学校高等数学竞赛': ['高数竞赛', '高等数学', 'gaoshu'],
  '五一数学建模竞赛': ['五一数模', 'wuyi'],
  '全国大学生智能汽车竞赛': ['智能车', 'smartcar'],
  '全国大学生结构设计竞赛': ['结构设计', '结构'],
  '全国大学生化工设计竞赛': ['化工设计'],
  '全国大学生生物医学工程创新设计竞赛': ['生物医学工程'],
  '中国机器人及人工智能大赛': ['机器人AI', 'RAICOM'],
  '睿抗机器人开发者大赛（RAICOM）': ['睿抗', 'raicom'],
  '全国大学生机器人大赛（RoboMaster、Robocon、RoboTac）': ['RoboMaster', 'robotmaster', '机甲大师', 'robocon'],
  '中国大学生机械工程创新创意大赛（创意赛道、创新赛道、毕业设计赛道）': ['机械工程创新', '机械创意'],
  '全国大学生集成电路创新创业大赛': ['集成电路', '集创'],
  '全国大学生创新年会展示': ['创新年会'],
  'iCAN大学生创新创业大赛': ['ican', '艾肯'],
  '全国大学生职业规划大赛': ['职业规划', '职规'],
  '全国大学生生命科学竞赛(CULSC)': ['生命科学', 'CULSC'],
  '全国大学生物理实验竞赛': ['物理实验'],
  '全国大学生化学实验创新设计大赛': ['化学实验'],
  '全国大学生统计建模大赛': ['统计建模'],
  '全国大学生广告艺术大赛': ['大广赛', '广告艺术'],
  '全国大学生数字媒体科技作品及创意竞赛': ['数媒', '数字媒体'],
  '未来设计师·全国高校数字艺术设计大赛': ['未来设计师', 'NCDA'],
  '中国好创意暨全国数字艺术设计大赛': ['好创意', '中国好创意'],
  '全国大学生工业设计大赛': ['工业设计'],
  '两岸新锐设计竞赛·华灿奖': ['华灿奖'],
  '米兰设计周-中国高校设计学科师生优秀作品展': ['米兰设计周'],
  '东方设计奖·全国高校创新设计大赛': ['东方设计'],
  '全国高校数字艺术设计大赛': ['数字艺术']
};

function getAlias(comp) {
  var a = ALIAS[comp.name];
  var list = Array.isArray(a) ? a.slice() : [];
  /* 自动派生: 去括号短名 */
  var short = comp.name.replace(/[（(].*?[)）]/g, '');
  if (short && short !== comp.name) list.push(short);
  return list;
}

/* 把汉字转拼音（字典查不到的原样保留） */
function toPinyin(s, firstOnly) {
  var out = '';
  for (var i = 0; i < s.length; i++) {
    var ch = s[i];
    if (/[\u4e00-\u9fa5]/.test(ch)) {
      var p = PY[ch];
      if (p) out += firstOnly ? p[0] : p;
      else out += ch;
    } else if (/[a-zA-Z0-9]/.test(ch)) {
      out += ch.toLowerCase();
    }
    /* 跳过标点 */
  }
  return out;
}

/* 为每条竞赛预计算索引 */
var INDEX = null;
function buildIndex(comps) {
  INDEX = comps.map(function (c) {
    var aliases = getAlias(c);
    var pinyinFull = toPinyin(c.name, false);
    var pinyinInit = toPinyin(c.name.replace(/[（(，、“”]/g, ''), true);
    return {
      comp: c,
      name: c.name,
      lower: c.name.toLowerCase(),
      aliases: aliases.map(function (a) { return a.toLowerCase(); }),
      pinyinFull: pinyinFull,
      pinyinInit: pinyinInit
    };
  });
}

/**
 * 搜索
 * @returns [{comp, hitType, score}] 按相关度排序
 */
function search(query, limit) {
  if (!INDEX) return [];
  var q = (query || '').trim().toLowerCase();
  if (!q) return [];
  var results = [];
  for (var i = 0; i < INDEX.length; i++) {
    var it = INDEX[i];
    var hit = null, score = 0, hitType = '';

    /* 1. 别名精确/前缀（最高权重） */
    for (var j = 0; j < it.aliases.length; j++) {
      var al = it.aliases[j];
      if (al === q) { hit = al; hitType = 'alias'; score = 100; break; }
      if (al.indexOf(q) === 0) { hit = al; hitType = 'alias'; score = 80; break; }
      if (al.indexOf(q) >= 0) { hit = al; hitType = 'alias'; score = 60; break; }
    }
    /* 2. 名称前缀 */
    if (!hit && it.lower.indexOf(q) === 0) { hit = q; hitType = 'prefix'; score = 90; }
    /* 3. 名称子串 */
    if (!hit && it.lower.indexOf(q) >= 0) { hit = q; hitType = 'substr'; score = 70; }
    /* 4. 全拼匹配 */
    if (!hit && it.pinyinFull.indexOf(q) >= 0) { hit = q; hitType = 'pinyin'; score = 50; }
    /* 5. 拼音首字母 */
    if (!hit && it.pinyinInit.indexOf(q) >= 0) { hit = q; hitType = 'initial'; score = 40; }
    /* 6. 逐字模糊（所有输入字符都出现且顺序一致） */
    if (!hit && fuzzySub(it.lower, q)) { hit = q; hitType = 'fuzzy'; score = 30; }
    if (!hit && fuzzySub(it.pinyinInit, q)) { hit = q; hitType = 'fuzzy'; score = 25; }

    if (hit) {
      results.push({ comp: it.comp, hitType: hitType, score: score, name: it.name });
    }
  }
  results.sort(function (a, b) {
    /* 类别高(Ⅰ类甲)优先级略提升 */
    var ca = classWeight(a.comp), cb = classWeight(b.comp);
    if (b.score !== a.score) return b.score - a.score;
    return cb - ca;
  });
  return limit ? results.slice(0, limit) : results;
}

function classWeight(c) {
  var base = c.class === 'Ⅰ' ? 3 : c.class === 'Ⅱ' ? 2 : 1;
  var tier = c.tier === '甲' ? 3 : c.tier === '乙' ? 2 : 1;
  return base * 10 + tier;
}

/* 子序列模糊匹配 */
function fuzzySub(hay, needle) {
  var i = 0;
  for (var j = 0; j < hay.length && i < needle.length; j++) {
    if (hay[j] === needle[i]) i++;
  }
  return i === needle.length;
}

/* 高亮 HTML 转义 + 标记命中 */
function highlight(text, query) {
  var q = (query || '').trim();
  if (!q) return escapeHtml(text);
  var idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx >= 0) {
    return escapeHtml(text.slice(0, idx)) + '<mark>' + escapeHtml(text.slice(idx, idx + q.length)) + '</mark>' + escapeHtml(text.slice(idx + q.length));
  }
  return escapeHtml(text);
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

global.ZC_SEARCH = {
  buildIndex: buildIndex,
  search: search,
  highlight: highlight,
  toPinyin: toPinyin
};
if (typeof module !== 'undefined') module.exports = global.ZC_SEARCH;
})(typeof window !== 'undefined' ? window : globalThis);
