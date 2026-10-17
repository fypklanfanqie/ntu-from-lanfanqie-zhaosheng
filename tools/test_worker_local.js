/**
 * 本地离线测试 Worker 解析逻辑（用真实抓取的 HTML）
 * 验证：文章识别 / 日期提取 / 报名截止提取 / 报名链接 / 状态 / 目录匹配
 */
const fs = require('fs');
const path = require('path');

// 读取 Worker 源码中的关键函数（用正则抽取 + eval，模拟运行环境）
const src = fs.readFileSync('worker/src/index.js', 'utf8');
const catalogSrc = fs.readFileSync('worker/src/catalog.js', 'utf8');
const catMod = {};
new Function('exports', catalogSrc.replace(/export const (\w+) =/g, 'exports.$1 =') + ';')(catMod);
const { CATALOG, ALIASES } = catMod;

// 提取关键常量/函数
const HIT = /竞赛|大赛|比赛|报名|选拔|挑战杯|锦标赛|创新创业|申报|征集|训练营/;
const EXCLUDE = /获奖|获佳绩|斩获|喜报|荣获|名单|公示|结果|评审结果|结项|立项结果|表彰|捷报|风采/;
const SOON = /即将|预告|预通知|拟于|将举办|将启动|筹备|先期/;
const OPEN = /报名|启动|开始|选拔|组织参加|组织学生|征集|申报|举办/;
const ART_URL = /\/(20\d{2})\/(\d{2})(\d{2})\/c\d+a\d+\/page\.htm/;

// 直接抓 live HTML？这里用已保存的调试文件
const html = fs.readFileSync('tools/debug_list.html', 'utf8');

function parseList(html, src) {
  const items = [];
  const seen = new Set();
  const re = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]{4,220}?)<\/a>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const href = m[1];
    const hit = ART_URL.exec(href);
    if (!hit) continue;
    const title = m[2].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    if (title.length < 6 || title.length > 130) continue;
    if (!HIT.test(title)) continue;
    if (EXCLUDE.test(title)) continue;
    const date = `${hit[1]}-${hit[2]}-${hit[3]}`;
    if (seen.has(href)) continue;
    seen.add(href);
    items.push({ key: href, title, url: href, date, source: src.name, college: src.college, status: 'watch' });
  }
  return items;
}

console.log('=== 1. 列表解析（创新创业学院通知公告）===');
const items = parseList(html, { name: '创新创业学院·通知公告', college: '校级' });
items.forEach(i => console.log(' ', i.date, '|', i.title.slice(0, 56), '|', i.url.slice(0, 40)));

console.log('\n=== 2. 目录匹配 ===');
const ALIAS_KEYS = Object.keys(ALIASES).sort((a, b) => b.length - a.length);
function matchTitle(title) {
  const hits = new Set();
  for (const c of CATALOG) if (c.core.length >= 5 && title.includes(c.core)) hits.add(c.no);
  for (const k of ALIAS_KEYS) if (title.includes(k)) for (const no of ALIASES[k]) if (no > 0) hits.add(no);
  return [...hits];
}
let matched = 0;
items.forEach(i => {
  const hs = matchTitle(i.title);
  if (hs.length) { matched++; console.log(' ', i.title.slice(0, 42), '→', hs.map(no => CATALOG.find(c => c.no === no)?.core || no).join(' / ')); }
});
console.log(`匹配: ${matched}/${items.length}`);

console.log('\n=== 3. 截止时间提取测试 ===');
const CN_DATE = /(20\d{2})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日/;
const SHORT_DATE = /(\d{1,2})\s*月\s*(\d{1,2})\s*日/;
function extractDeadline(text, fallbackDate) {
  const idxs = [];
  ['截止', '截至', '报名时间', '报名日期', '申报截止', '提交截止'].forEach(k => {
    let i = text.indexOf(k);
    while (i >= 0 && idxs.length < 12) { idxs.push(i); i = text.indexOf(k, i + 1); }
  });
  idxs.sort((a, b) => a - b);
  const zones = idxs.map(i => text.slice(i, i + 90));
  for (const z of zones) { const d = z.match(CN_DATE); if (d) return `${d[1]}-${d[2].padStart(2,'0')}-${d[3].padStart(2,'0')}`; }
  const y = (fallbackDate || '').slice(0, 4) || String(new Date().getFullYear());
  const qian = text.match(/(\d{1,2})\s*月\s*(\d{1,2})\s*日\s*(?:上午|下午)?[^。；]{0,6}?前/);
  if (qian) return `${y}-${qian[1].padStart(2,'0')}-${qian[2].padStart(2,'0')}`;
  for (const z of zones) { const s = z.match(SHORT_DATE); if (s) return `${y}-${s[1].padStart(2,'0')}-${s[2].padStart(2,'0')}`; }
  return '';
}
const samples = [
  ['三、竞赛报名 报名截止时间： 2026 年 8 月 1 日上午 10:00 报名方式', '2026-07-14'],
  ['请于2026年9月15日前将作品提交至邮箱', '2026-09-01'],
  ['截止时间：9月20日', '2026-09-01'],
  ['本次比赛不设报名截止，欢迎参加', '2026-09-01'],
];
samples.forEach(([t, d]) => console.log(' ', JSON.stringify(t.slice(0, 34)), '→', extractDeadline(t, d) || '(未识别)'));

console.log('\n=== 4. 状态判定 ===');
function computeStatus(it, now) {
  const today = new Date(now).toISOString().slice(0, 10);
  if (it.deadline) return it.deadline >= today ? 'open' : 'closed';
  const ageDays = Math.floor((now - Date.parse(it.date + 'T00:00:00Z')) / 864e5);
  if (it.closedSignal) return 'closed';
  if (SOON.test(it.title)) return 'soon';
  if (it.openSignal && ageDays <= 150) return 'open';
  if (OPEN.test(it.title)) { if (ageDays <= 75) return 'open'; if (ageDays <= 180) return 'watch'; return 'closed'; }
  return ageDays <= 180 ? 'watch' : 'closed';
}
const now = Date.now();
items.slice(0, 5).forEach(i => {
  const s = computeStatus({ ...i, deadline: i.deadline || '' }, now);
  console.log(' ', i.date, '|', s.padEnd(6), '|', i.title.slice(0, 44));
});
