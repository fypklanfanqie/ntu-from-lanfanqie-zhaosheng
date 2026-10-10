/**
 * 南通大学综测帮 — 竞赛通知每周抓取 Worker
 * ================================================================
 * 功能:
 * 1. Cron Trigger 每周一 08:00 UTC（北京时间 16:00）抓取:
 *    - 南通大学创新创业教育学院通知公告 (cxcyxy.ntu.edu.cn/10412/list.htm)
 *    - 各承办学院通知栏目（分批，每次运行抓一部分学院，避免超时）
 * 2. 解析含"竞赛/大赛/报名/选拔赛"关键词的通知标题+日期+链接
 * 3. 结果写入 Cloudflare KV（JSON），并更新统计摘要
 * 4. HTTP 触发时返回 JSON API（/api/notifications, /api/trigger 手动触发）
 *
 * 绑定:
 *   KV namespace:  ZC_KV   (wrangler kv namespace create ZC_KV)
 *   Cron:          0 0 * * 1  (每周一 UTC 0点 = 北京 08:00)
 *
 * 部署: cd worker && npx wrangler deploy
 */

const SOURCES = [
  // 校级源（最重要，每次 cron 必抓前 3 个）
  { id: 'cxcyxy', name: '创新创业教育学院（校级竞赛通知）', listUrl: 'https://cxcyxy.ntu.edu.cn/10412/list.htm', college: null },
  { id: 'cxcyxy2', name: '创新创业教育学院（通知公告 第2页）', listUrl: 'https://cxcyxy.ntu.edu.cn/10412/list2.htm', college: null },
  { id: 'cxcyxy3', name: '创新创业教育学院（通知公告 第3页）', listUrl: 'https://cxcyxy.ntu.edu.cn/10412/list3.htm', college: null },
  // 学院源（仅收录有静态通知列表页的；其余学院以校内通知为准）
  { id: 'jxgc', name: '机械工程学院', listUrl: 'https://sme.ntu.edu.cn/11619/list.htm', college: '机械工程学院' },
  { id: 'jxgc2', name: '机械工程学院（第2页）', listUrl: 'https://sme.ntu.edu.cn/11619/list2.htm', college: '机械工程学院' },
  { id: 'hgxy', name: '化学化工学院', listUrl: 'https://hgxy.ntu.edu.cn/', college: '化学化工学院' },
  { id: 'sxtj', name: '数学与统计学院', listUrl: 'https://sms.ntu.edu.cn/', college: '数学与统计学院' },
  { id: 'yxy', name: '医学院', listUrl: 'https://yxy.ntu.edu.cn/', college: '医学院' },
  { id: 'cgxy', name: '艺术学院', listUrl: 'https://ysxy.ntu.edu.cn/', college: '艺术学院（建筑学院）' },
  { id: 'sgxy', name: '商学院', listUrl: 'https://sem.ntu.edu.cn/', college: '商学院（管理学院）' },
];

// 通知标题过滤关键词：命中即收录
const KEYWORDS = [
  '竞赛', '大赛', '报名', '选拔赛', '邀请赛', '挑战杯', '模拟', '训练营',
  ' Chap', '杯', '锦标赛', '创新创业大赛'
];
// 排除词
const EXCLUDE = /获奖|成绩公示|获奖名单|结果公示|喜报|获佳绩|斩获|答辩安排|评选结果/;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runFetch(env));
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS });
    }
    if (url.pathname === '/api/notifications') {
      const data = await env.ZC_KV.get('zc:notifications', 'json');
      return jsonResponse({ ok: true, data: data || { items: [], updated: null } });
    }
    if (url.pathname === '/api/trigger' && request.method === 'POST') {
      // 手动触发（可加 secret 校验）
      const auth = request.headers.get('X-Auth-Token');
      if (env.TRIGGER_SECRET && auth !== env.TRIGGER_SECRET) {
        return jsonResponse({ ok: false, error: 'unauthorized' }, 401);
      }
      const result = await runFetch(env);
      return jsonResponse({ ok: true, result });
    }
    return new Response('ZC Competition Fetcher OK. Endpoints: /api/notifications, POST /api/trigger', {
      headers: { ...CORS, 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
};

/* ---------- 主流程 ---------- */
async function runFetch(env) {
  const started = Date.now();
  // 轮转：每次 cron 抓 3 个源（控制 CPU 时间），记录游标
  let cursor = parseInt(await env.ZC_KV.get('zc:cursor') || '0', 10);
  if (cursor >= SOURCES.length) cursor = 0;
  const batch = SOURCES.slice(cursor, cursor + 3);
  const nextCursor = (cursor + 3) % SOURCES.length;

  const all = [];
  for (const src of batch) {
    try {
      const items = await fetchList(src);
      all.push(...items);
    } catch (e) {
      all.push({ source: src.name, error: String(e).slice(0, 120) });
    }
  }

  // 合并历史（保留近 90 天）
  const prev = (await env.ZC_KV.get('zc:notifications', 'json')) || { items: [] };
  const byKey = {};
  for (const it of prev.items || []) byKey[it.key] = it;
  for (const it of all) {
    if (it.key) byKey[it.key] = it; // 新数据覆盖
  }
  const cutoff = Date.now() - 90 * 86400e3;
  const items = Object.values(byKey)
    .filter((it) => it.key && (!it.ts || it.ts > cutoff))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  const payload = {
    items,
    updated: new Date().toISOString(),
    lastBatch: batch.map((s) => s.id),
    nextCursor,
    tookMs: Date.now() - started,
  };
  await env.ZC_KV.put('zc:notifications', JSON.stringify(payload));
  await env.ZC_KV.put('zc:cursor', String(nextCursor));
  return payload;
}

/* ---------- 抓取一个列表页 ---------- */
async function fetchList(src) {
  const res = await fetch(src.listUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NTU-ZongCeBot/1.0)' },
    cf: { cacheTtl: 0 },
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const html = await res.text();
  const out = [];

  // 通用的 <a href='...'>标题</a> + 邻近日期 提取
  // 兼容 webplus CMS 的单引号/双引号属性、标题内嵌标签
  const linkRe = /<a[^>]+href=["']([^"']+?)["'][^>]*>([\s\S]{6,200}?)<\/a>/g;
  const dateRe = /(\d{4})-(\d{2})-(\d{2})/;
  const tagRe = /<[^>]+>/g;
  let m;
  while ((m = linkRe.exec(html)) !== null) {
    const href = m[1];
    const title = m[2].replace(tagRe, '').replace(/\s+/g, ' ').trim();
    if (!/^\/|https?:/.test(href)) continue;
    if (title.length < 6 || title.length > 120) continue;
    if (!KEYWORDS.some((k) => title.includes(k))) continue;
    if (EXCLUDE.test(title)) continue;
    // 在链接附近的 HTML 片段里找日期（发布日期通常在链接之后）
    const ctx = html.slice(Math.max(0, m.index - 100), m.index + 400);
    const dm = ctx.match(dateRe);
    const date = dm ? dm[0] : '';
    const abs = href.startsWith('http') ? href : new URL(href, src.listUrl).href;
    out.push({
      key: abs,
      title,
      url: abs,
      date,
      source: src.name,
      college: src.college || '校级',
      ts: dm ? new Date(dm[0]).getTime() : Date.now(),
    });
  }
  // 去重
  const seen = new Set();
  return out.filter((it) => !seen.has(it.key) && seen.add(it.key));
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj, null, 2), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8' },
  });
}
