/**
 * 南通大学综测帮 — 竞赛通知抓取 Worker（v2）
 * ================================================================
 * 改进点（相对 v1）:
 * 1. 严格文章链接识别：只接受 webplus CMS 文章 URL 模式（/20XX/MMDD/cNNNaNNNNN/page.htm）
 *    —— 彻底过滤导航菜单/栏目名等垃圾条目
 * 2. 发布日期从 URL 提取（/2026/0924/ → 2026-09-24），不再依赖邻近 HTML 猜日期
 * 3. 抓取文章详情，提取【报名截止时间】与【报名入口链接】
 *    —— 状态判定从"关键词猜测"升级为"按截止日期判定"
 * 4. 服务端竞赛匹配（内置 172 项目录 + 119 条别名）→ /api/matches
 * 5. 每小时运行，主源（创新创业学院通知）每次必抓，其余源轮转
 *
 * 绑定: KV namespace ZC_KV
 * Cron: 5 * * * *  （每小时 5 分）
 */
import { CATALOG, ALIASES } from './catalog.js';

const SOURCES = [
  /* 主源：创新创业教育学院通知公告（校级竞赛通知发布口）— 每次必抓 */
  { id: 'cxcyxy1', name: '创新创业学院·通知公告', listUrl: 'https://cxcyxy.ntu.edu.cn/10412/list.htm', college: '校级', always: true },
  { id: 'cxcyxy2', name: '创新创业学院·通知公告(2)', listUrl: 'https://cxcyxy.ntu.edu.cn/10412/list2.htm', college: '校级' },
  { id: 'cxcyxy3', name: '创新创业学院·通知公告(3)', listUrl: 'https://cxcyxy.ntu.edu.cn/10412/list3.htm', college: '校级' },
  { id: 'cxcyxy4', name: '创新创业学院·通知公告(4)', listUrl: 'https://cxcyxy.ntu.edu.cn/10412/list4.htm', college: '校级' },
  { id: 'cxcyxy5', name: '创新创业学院·通知公告(5)', listUrl: 'https://cxcyxy.ntu.edu.cn/10412/list5.htm', college: '校级' },

  /* 竞赛通知产出高的学院栏目 */
  { id: 'fzfz', name: '纺织服装学院·教学通知', listUrl: 'https://fzfz.ntu.edu.cn/jxtz/list.htm', college: '纺织服装学院' },
  { id: 'fzfz2', name: '纺织服装学院·教学通知(2)', listUrl: 'https://fzfz.ntu.edu.cn/jxtz/list2.htm', college: '纺织服装学院' },
  { id: 'sem', name: '商学院·通知公告', listUrl: 'https://sem.ntu.edu.cn/11410/list.htm', college: '商学院（管理学院）' },
  { id: 'sem2', name: '商学院·通知公告(2)', listUrl: 'https://sem.ntu.edu.cn/11410/list2.htm', college: '商学院（管理学院）' },
  { id: 'sme', name: '机械工程学院·通知公告', listUrl: 'https://sme.ntu.edu.cn/tzgg_1145/list.htm', college: '机械工程学院' },
  { id: 'dqxy', name: '电气与自动化学院·通知公告', listUrl: 'https://dqxy.ntu.edu.cn/tzgg/list.htm', college: '电气与自动化学院' },
  { id: 'jttm', name: '交通与土木工程学院·学院公告', listUrl: 'https://jttm.ntu.edu.cn/xygg/list.htm', college: '交通与土木工程学院（交通学院）' },
  { id: 'hgxy', name: '化学化工学院·学生工作', listUrl: 'https://hgxy.ntu.edu.cn/xshd/list.htm', college: '化学化工学院' },
  { id: 'sist', name: '信息科学技术学院·通知公告', listUrl: 'https://sist.ntu.edu.cn/5061/list.htm', college: '信息科学技术学院（通科微电子学院）' },
  { id: 'meic', name: '微电子学院·创新创业', listUrl: 'https://meic.ntu.edu.cn/cxcy/list.htm', college: '微电子学院（集成电路学院）' },
  { id: 'ai', name: '人工智能与计算机学院·通知公告', listUrl: 'https://ai.ntu.edu.cn/9833/list.htm', college: '人工智能与计算机学院（阿里云大数据学院）' },
  { id: 'yxy', name: '医学院·通知公告', listUrl: 'https://yxy.ntu.edu.cn/3651/list.htm', college: '医学院' },
  { id: 'yxy2', name: '医学院·学科竞赛', listUrl: 'https://yxy.ntu.edu.cn/3944/list.htm', college: '医学院' },
  { id: 'gw', name: '公共卫生学院·通知公告', listUrl: 'https://gw.ntu.edu.cn/tzgg/list.htm', college: '公共卫生学院' },
  { id: 'phar', name: '药学院·通知公告', listUrl: 'https://phar.ntu.edu.cn/tzgg/list.htm', college: '药学院' },
  { id: 'phys', name: '物理科学与技术学院·通知公告', listUrl: 'https://phys.ntu.edu.cn/tzgg/list.htm', college: '物理科学与技术学院' },
  { id: 'sms', name: '数学与统计学院·教学通知', listUrl: 'https://sms.ntu.edu.cn/jxtz/list.htm', college: '数学与统计学院' },
  { id: 'ysxy', name: '艺术学院·团学工作', listUrl: 'https://ysxy.ntu.edu.cn/4685/list.htm', college: '艺术学院（建筑学院）' },
  { id: 'tky', name: '体育科学学院·通知公告', listUrl: 'https://tky.ntu.edu.cn/tzgg/list.htm', college: '体育科学学院' },
  { id: 'jky', name: '教育科学学院·通知公告', listUrl: 'https://jky.ntu.edu.cn/3822/list.htm', college: '教育科学学院' },
  { id: 'jsjy', name: '教师教育学院·通知公告', listUrl: 'https://jsjy.ntu.edu.cn/tzgg/list.htm', college: '教师教育学院' },
  { id: 'zjxy', name: '张謇学院·素质拓展', listUrl: 'https://zjxy.ntu.edu.cn/sztz/list.htm', college: '张謇学院' },
  { id: 'wxy', name: '文学院·通知公告', listUrl: 'https://wxy.ntu.edu.cn/9452/list.htm', college: '文学院' },
  { id: 'tw', name: '校团委·通知通告', listUrl: 'https://tw.ntu.edu.cn/2791/list.htm', college: '校级' },
  { id: 'xgc', name: '学生工作处·通知公告', listUrl: 'https://xgc.ntu.edu.cn/_s84/2610/list.psp', college: '校级' },
  { id: 'jwc', name: '教务处', listUrl: 'https://jwc.ntu.edu.cn/', college: '校级' },
];

/* 命中关键词：必须是竞赛类通知 */
const HIT = /竞赛|大赛|比赛|挑战杯|锦标赛|选拔赛|擂台赛|创新创业大赛|互联网\+|国创赛/;
/* 排除：获奖/结果/行政公示类（注意不要误伤竞赛名，如"智能审计"） */
const EXCLUDE = /获奖|获佳绩|斩获|喜报|荣获|捷报|风采|名单|公示|结果|评审结果|结项|立项结果|表彰|职称|职务|招聘|招生|调剂|推免|奖学金|助学金|评奖|评优|竞聘|述职|巡察|审计整改|预算|招标|采购|任职|公示期|情况通报/;
/* 「即将开始」信号 */
const SOON = /即将|预告|预通知|拟于|将举办|将启动|筹备|先期/;
/* 「正在进行」信号 */
const OPEN = /报名|启动|开始|选拔|组织参加|组织学生|征集|申报|举办/;
/* 文章 URL：webplus CMS 标准模式，路径自带日期 */
const ART_URL = /\/(20\d{2})\/(\d{2})(\d{2})\/c\d+a\d+\/page\.htm/;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async scheduled(event, env, ctx) {
    // 每天一次全量抓取
    ctx.waitUntil(run(env, { full: true }));
  },
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    if (url.pathname === '/api/notifications') {
      const data = (await env.ZC_KV.get('zc:notifications', 'json')) || { items: [], updated: null };
      return json({ ok: true, data });
    }
    if (url.pathname === '/api/matches') {
      const data = (await env.ZC_KV.get('zc:matches', 'json')) || { matches: {}, updated: null };
      return json({ ok: true, data });
    }
    if (url.pathname === '/api/all') {
      const [n, m] = await Promise.all([
        env.ZC_KV.get('zc:notifications', 'json'),
        env.ZC_KV.get('zc:matches', 'json'),
      ]);
      return json({
        ok: true,
        data: {
          items: (n && n.items) || [],
          matches: (m && m.matches) || {},
          updated: (n && n.updated) || null,
          stats: (n && n.stats) || null,
        },
      });
    }
    if (url.pathname === '/api/trigger' && request.method === 'POST') {
      const auth = request.headers.get('X-Auth-Token');
      if (env.TRIGGER_SECRET && auth !== env.TRIGGER_SECRET) return json({ ok: false, error: 'unauthorized' }, 401);
      const full = url.searchParams.get('full') === '1';
      const result = await run(env, { full });
      return json({ ok: true, result });
    }
    return new Response(
      'NTU 综测帮 · 竞赛通知抓取 Worker\n\nGET  /api/notifications  通知列表\nGET  /api/matches        竞赛报名状态\nGET  /api/all            合并返回\nPOST /api/trigger?full=1  手动全量抓取',
      { headers: { ...CORS, 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  },
};

/* ================================================================
   主流程
   ================================================================ */
async function run(env, opts = {}) {
  const t0 = Date.now();
  const now = Date.now();

  // 选源：主源必抓；其余按游标轮转（免费版 10ms CPU，单次控制在 2 个源 + 1 篇详情）
  let cursor = parseInt((await env.ZC_KV.get('zc:cursor')) || '0', 10);
  let batch;
  if (opts.full) {
    batch = SOURCES;
  } else {
    const always = SOURCES.filter((s) => s.always);
    const rest = SOURCES.filter((s) => !s.always);
    if (cursor >= rest.length) cursor = 0;
    batch = always.concat(rest.slice(cursor, cursor + 1));
    cursor = (cursor + 1) % rest.length;
  }

  // 并发抓列表
  const lists = await Promise.all(
    batch.map((src) =>
      fetchList(src).catch((e) => ({ src, items: [], error: String(e).slice(0, 100) }))
    )
  );

  const fresh = [];
  const errors = [];
  for (const r of lists) {
    if (r.error) { errors.push({ source: r.src.name, error: r.error }); continue; }
    fresh.push(...r.items);
  }

  // 合并历史（并清理旧版本留下的无效条目：URL 必须是标准文章页）
  const prev = (await env.ZC_KV.get('zc:notifications', 'json')) || { items: [] };
  const byKey = {};
  for (const it of prev.items || []) {
    if (!it.key || !ART_URL.test(it.url || '') || !it.date) continue; // 迁移清理
    byKey[it.key] = it;
  }
  for (const it of fresh) {
    const old = byKey[it.key];
    if (old) {
      /* 保留已解析的详情，但解析版本不同则丢弃重算 */
      const keepDetail = old.detailVer === DETAIL_VERSION;
      byKey[it.key] = keepDetail
        ? { ...it, deadline: old.deadline, eventDate: old.eventDate, regUrl: old.regUrl, regLabel: old.regLabel, hasRegWay: old.hasRegWay, closedSignal: old.closedSignal, detailed: true, detailVer: DETAIL_VERSION }
        : it;
    } else {
      byKey[it.key] = it;
    }
  }

  // 保留 210 天；按日期倒序；按「标题+日期」去重（同一通知可能被多个栏目转载）
  const seenTitles = new Set();
  const items = Object.values(byKey)
    .filter((it) => it.key && isoTime(it.date) > now - 210 * 864e5)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .filter((it) => {
      const t = (it.title || '').replace(/\s+/g, '');
      const k = t + '|' + (it.date || '');
      if (seenTitles.has(k)) return false;
      seenTitles.add(k);
      return true;
    });

  // 详情补全：为最近的竞赛通知抓取「报名截止/报名入口/比赛时间」
  // 每天一次，限 30 篇、并发 5（避免对学校站点造成压力）
  const needDetail = items
    .filter((it) => (!it.detailed || it.detailVer !== DETAIL_VERSION) && (now - isoTime(it.date)) < 200 * 864e5)
    .slice(0, opts.full ? 30 : 2);
  for (let i = 0; i < needDetail.length; i += 5) {
    await Promise.all(
      needDetail.slice(i, i + 5).map((it) => enrichDetail(it, env).catch(() => { it.detailed = true; }))
    );
  }

  // 计算状态
  for (const it of items) it.status = computeStatus(it, now);

  // 匹配竞赛目录
  const { matches, stats } = buildMatches(items, now);

  const payload = {
    items,
    updated: new Date().toISOString(),
    stats: { ...stats, total: items.length, sources: batch.map((s) => s.id), errors },
    tookMs: Date.now() - t0,
  };
  await env.ZC_KV.put('zc:notifications', JSON.stringify(payload));
  await env.ZC_KV.put('zc:matches', JSON.stringify({ matches, updated: payload.updated }));
  await env.ZC_KV.put('zc:cursor', String(cursor));
  return payload;
}

/* ================================================================
   列表页解析
   ================================================================ */
async function fetchList(src) {
  const res = await fetch(src.listUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36' },
    cf: { cacheTtl: 0 },
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  let html = await res.text();

  // CPU 优化：只解析列表区域（webplus 列表容器），避免全文正则扫描
  const anchor = html.indexOf('wp_article_list');
  if (anchor > 0) html = html.slice(anchor, anchor + 16000);

  const items = [];
  const seen = new Set();

  const re = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]{4,220}?)<\/a>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const href = m[1];
    const hit = ART_URL.exec(href);
    if (!hit) continue; // 只接受标准文章链接 → 天然过滤导航/菜单
    const title = m[2].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    if (title.length < 6 || title.length > 130) continue;
    if (!HIT.test(title)) continue;
    if (EXCLUDE.test(title)) continue;

    const date = `${hit[1]}-${hit[2]}-${hit[3]}`;
    const abs = href.startsWith('http') ? href : new URL(href, src.listUrl).href;
    if (seen.has(abs)) continue;
    seen.add(abs);
    items.push({
      key: abs,
      title,
      url: abs,
      date,
      source: src.name,
      college: src.college || '校级',
      status: 'watch',
      detailed: false,
    });
  }
  return { src, items };
}

/* ================================================================
   详情页：提取报名截止 / 报名时间范围 / 比赛时间 / 报名入口
   ================================================================ */
const CN_DATE = /(20\d{2})\s*[年.\-/]\s*(\d{1,2})\s*[月.\-/]\s*(\d{1,2})\s*日?/;
const CN_SHORT = /(\d{1,2})\s*月\s*(\d{1,2})\s*日/;

/* 详情解析算法版本：升级后旧条目会强制重新解析 */
const DETAIL_VERSION = 2;

async function enrichDetail(item, env) {
  const res = await fetch(item.url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36' },
    cf: { cacheTtl: 0 },
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const html = await res.text();

  let body = html;
  const m = body.match(/wp_articlecontent[\s\S]{0,200}?>([\s\S]*?)<\/div>/);
  if (m) body = m[1];

  const text = body
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ');

  const year = (item.date || '').slice(0, 4) || String(new Date().getFullYear());

  /* 1) 报名截止时间（分句精确匹配，避免误取比赛时间） */
  item.deadline = extractDeadline(text, year);

  /* 2) 比赛/举办时间（用于判断是否已结束） */
  item.eventDate = extractEventDate(text, year);

  /* 3) 报名入口 */
  item.regUrl = extractRegUrl(body, item.url);
  item.regLabel = extractRegLabel(text);

  /* 4) 正文信号 */
  item.hasRegWay = /报名方式|报名链接|扫码报名|填写报名|报名表|在线报名|报名系统|提交材料|提交作品|作品提交/.test(text);
  item.closedSignal = /报名已结束|报名截止|已截止|报名已满/.test(text);
  item.detailed = true;
  item.detailVer = DETAIL_VERSION;
}

/* 按句子找报名截止：句中须同时含「报名/申报/提交/材料」与「截止/截至/前」 */
function extractDeadline(text, year) {
  const sents = text.split(/[。；;！\n\r]/).map((s) => s.trim()).filter((s) => s.length > 3);

  /* 1) 含「截止/截至」且含报名类词的句子（最可靠） */
  const deadlineSents = sents.filter((s) => /截止|截至/.test(s) && /报名|申报|提交|材料|作品|回执|报送/.test(s));
  for (const s of deadlineSents) {
    const full = s.match(CN_DATE);
    if (full) return toISO(full[1], full[2], full[3]);
  }
  for (const s of deadlineSents) {
    const q = s.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*日/);
    if (q) return toISO(year, q[1], q[2]);
  }

  /* 2) 报名时间范围：只在「报名时间」后的短窗口内找，避免串到比赛时间 */
  for (const s of sents) {
    const at = s.indexOf('报名时间') >= 0 ? s.indexOf('报名时间') : s.indexOf('报名日期');
    if (at < 0) continue;
    let win = s.slice(at, at + 80);
    /* 遇到后续「比赛/竞赛/平台/地点」即截断 */
    const cut = win.search(/比赛时间|竞赛时间|比赛日期|竞赛日期|平台|地点|费用|联系/);
    if (cut > 0) win = win.slice(0, cut);
    /* 优先「A - B」范围，取 B */
    const range = win.match(/(?:20\d{2}\s*年\s*)?(\d{1,2})\s*月\s*(\d{1,2})\s*日\s*[-—~～至到]\s*(?:20\d{2}\s*年\s*)?(\d{1,2})\s*月\s*(\d{1,2})\s*日/);
    if (range) return toISO(year, range[3], range[4]);
    /* 只有一个日期则取它 */
    const one = win.match(CN_DATE) || win.match(CN_SHORT);
    if (one) {
      return one.length === 4 ? toISO(one[1], one[2], one[3]) : toISO(year, one[1], one[2]);
    }
  }

  /* 3) 兜底：「请于…前」且句中含报名/提交/参赛 */
  for (const s of sents) {
    if (/(报名|提交|申报|报送|参赛)/.test(s) && /前/.test(s)) {
      const full = s.match(CN_DATE);
      if (full) return toISO(full[1], full[2], full[3]);
      const q = s.match(CN_SHORT);
      if (q) return toISO(year, q[1], q[2]);
    }
  }
  return '';
}

/* 比赛/举办时间（不是报名时间）：只在关键词后的短窗口取日期 */
function extractEventDate(text, year) {
  const KW = /比赛时间|竞赛时间|举办时间|决赛时间|考试时间|答辩时间|举行时间/g;
  let m;
  while ((m = KW.exec(text)) !== null) {
    let win = text.slice(m.index + m[0].length, m.index + m[0].length + 40);
    const cut = win.search(/报名|平台|地点|形式|对象|费用|联系/);
    if (cut > 0) win = win.slice(0, cut);
    const full = win.match(CN_DATE);
    if (full) return toISO(full[1], full[2], full[3]);
    const q = win.match(CN_SHORT);
    if (q) return toISO(year, q[1], q[2]);
  }
  return '';
}

function extractRegUrl(html, base) {
  const urls = [];
  const re = /<a[^>]+href=["'](https?:\/\/[^"']+)["'][^>]*>([\s\S]{0,80}?)<\/a>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const u = m[1];
    const t = m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, '');
    if (/ntu\.edu\.cn/.test(u)) continue;
    if (/weixin\.qq\.com|mp\.weixin/.test(u)) continue;
    const isForm = /docs\.qq\.com|wjx\.cn|kdocs\.cn|jsform|shimo\.im|f\.wps\.cn|wj\.qq\.com|form|kmform|jsj\.top/i.test(u);
    const isRegText = /报名|申报|提交|参赛|注册|填报|填写|表单|系统|链接/.test(t);
    if (isForm || isRegText) urls.push({ u, score: (isForm ? 2 : 0) + (isRegText ? 1 : 0) });
  }
  urls.sort((a, b) => b.score - a.score);
  return urls.length ? urls[0].u : '';
}

function extractRegLabel(text) {
  if (/腾讯文档|docs\.qq\.com/.test(text)) return '腾讯文档报名表';
  if (/问卷星|wjx/.test(text)) return '问卷星报名表';
  if (/学习通|超星|chaoxing/.test(text)) return '学习通平台';
  if (/系统/.test(text)) return '报名系统';
  return '报名入口';
}

/* ================================================================
   状态判定（核心：按截止日期 → 比赛时间 → 通知时效）
   ================================================================ */
const NON_REG = /培训|培训班|宣讲|讲座|辅导|说明会|动员|经验分享|沙龙|课程|座谈会|解读/;

function computeStatus(it, now) {
  const today = new Date(now).toISOString().slice(0, 10);
  const ageDays = Math.floor((now - isoTime(it.date)) / 864e5);

  /* 0) 培训/宣讲类通知：不是报名通知，降级为参考 */
  if (NON_REG.test(it.title) && !it.deadline) return ageDays <= 120 ? 'watch' : 'closed';

  /* 1) 有报名截止：最权威 */
  if (it.deadline) return it.deadline >= today ? 'open' : 'closed';

  /* 2) 无截止但有比赛时间，且比赛已过 → 已结束 */
  if (it.eventDate && it.eventDate < today) return 'closed';

  /* 3) 明确「即将开始」 */
  if (SOON.test(it.title)) return 'soon';

  /* 4) 正文确认有报名方式 + 通知较新 → 正在报名 */
  if (it.hasRegWay && ageDays <= 45) return 'open';

  /* 5) 标题含报名/举办，但无截止与报名方式：按通知新鲜度保守判定 */
  if (OPEN.test(it.title)) {
    if (ageDays <= 30) return 'open';
    if (ageDays <= 180) return 'watch';
    return 'closed';
  }
  return ageDays <= 180 ? 'watch' : 'closed';
}

/* ================================================================
   竞赛目录匹配（服务端）
   ================================================================ */
function buildMatches(items, now) {
  /* 每项竞赛收集全部相关通知，再按「有截止日期优先 → 日期最新」择优 */
  const pool = {}; // no -> [notice]

  const sorted = items.slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  for (const n of sorted) {
    if (EXCLUDE.test(n.title)) continue;
    const ageDays = Math.floor((now - isoTime(n.date)) / 864e5);
    if (ageDays > 210) continue;

    const hits = resolveHits(n.title);
    if (!hits.length) continue;
    for (const no of hits) {
      (pool[no] = pool[no] || []).push(n);
    }
  }

  const matches = {};
  let open = 0, soon = 0, closed = 0;

  for (const no of Object.keys(pool)) {
    const list = pool[no];
    /* 1) 优先取「有截止日期」的最新通知 */
    const withDeadline = list.filter((n) => n.deadline).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    const pick = withDeadline[0] || list[0];
    matches[no] = {
      status: pick.status,
      deadline: pick.deadline || '',
      eventDate: pick.eventDate || '',
      notice: {
        title: pick.title, url: pick.url, date: pick.date, source: pick.source,
        college: pick.college, regUrl: pick.regUrl || '', regLabel: pick.regLabel || '',
      },
      alsoCount: list.length - 1,
    };
    if (pick.status === 'open') open++;
    else if (pick.status === 'soon') soon++;
    else if (pick.status === 'closed') closed++;
  }

  return { matches, stats: { matched: Object.keys(matches).length, open, soon, closed } };
}

/**
 * 标题 → 竞赛编号集合（最具体优先）
 * 规则:
 *  1. 目录短名（≥5 字）子串命中
 *  2. 别名命中，但若某别名是另一个更具体别名的子串，则丢弃（如"研究生数学建模"命中时不再用"数学建模"）
 */
function resolveHits(title) {
  const hits = new Set();

  // 1) 目录名精确子串
  for (const c of CATALOG) {
    if (c.core.length >= 5 && title.includes(c.core)) hits.add(c.no);
  }

  // 2) 别名：先收集命中的 key，再剔除被更长 key 包含的
  const matchedKeys = Object.keys(ALIASES)
    .filter((k) => title.includes(k))
    .sort((a, b) => b.length - a.length || 0);
  const kept = matchedKeys.filter((k, i) => {
    // 若存在另一个更长的已命中 key 包含 k，则 k 冗余
    return !matchedKeys.some((other) => other !== k && other.length > k.length && other.includes(k));
  });
  for (const k of kept) {
    for (const no of ALIASES[k] || []) if (no > 0) hits.add(no);
  }

  // 3) 上下文纠偏
  if (/研究生/.test(title)) { hits.delete(4); hits.delete(135); hits.delete(81); hits.add(6); }
  if (/五一/.test(title)) { hits.delete(4); hits.delete(6); hits.add(135); }
  if (/美国|美赛|MCM|ICM/.test(title)) { hits.delete(4); hits.delete(6); hits.delete(135); hits.add(80); }
  if (/挑战杯/.test(title) && /创业计划|创青春/.test(title)) { hits.delete(2); hits.add(3); }
  if (/挑战杯/.test(title) && /课外学术|大挑/.test(title)) { hits.delete(3); hits.add(2); }

  return [...hits];
}

/* ================================================================
   工具
   ================================================================ */
function toISO(y, m, d) {
  const mm = String(m).padStart(2, '0');
  const dd = String(d).padStart(2, '0');
  return `${y}-${mm}-${dd}`;
}
function isoTime(s) {
  if (!s) return 0;
  const t = Date.parse(s + 'T00:00:00Z');
  return isNaN(t) ? 0 : t;
}
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj, null, 2), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8' },
  });
}
