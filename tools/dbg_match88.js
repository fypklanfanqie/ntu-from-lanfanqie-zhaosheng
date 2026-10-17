// 复现 resolveHits，找出智能审计为何没匹配
const fs = require('fs');
const catSrc = fs.readFileSync('worker/src/catalog.js', 'utf8');
const mod = {};
new Function('exports', catSrc.replace(/export const (\w+) =/g, 'exports.$1 ='))(mod);
const { CATALOG, ALIASES } = mod;

const EXCLUDE = /获奖|获佳绩|斩获|喜报|荣获|捷报|风采|名单|公示|结果|评审结果|结项|立项结果|表彰|职称|职务|招聘|招生|调剂|推免|奖学金|助学金|评奖|评优|评审|竞聘|述职|巡察|审计|预算|招标|采购|任职|公示期|情况通报/;

function resolveHits(title) {
  const hits = new Set();
  for (const c of CATALOG) if (c.core.length >= 5 && title.includes(c.core)) hits.add(c.no);
  const matchedKeys = Object.keys(ALIASES).filter(k => title.includes(k)).sort((a, b) => b.length - a.length);
  const kept = matchedKeys.filter(k => !matchedKeys.some(o => o !== k && o.length > k.length && o.includes(k)));
  for (const k of kept) for (const no of ALIASES[k] || []) if (no > 0) hits.add(no);
  if (/研究生/.test(title)) { hits.delete(4); hits.delete(135); hits.delete(81); hits.add(6); }
  if (/五一/.test(title)) { hits.delete(4); hits.delete(6); hits.add(135); }
  if (/美国|美赛|MCM|ICM/.test(title)) { hits.delete(4); hits.delete(6); hits.delete(135); hits.add(80); }
  if (/挑战杯/.test(title) && /创业计划|创青春/.test(title)) { hits.delete(2); hits.add(3); }
  if (/挑战杯/.test(title) && /课外学术|大挑/.test(title)) { hits.delete(3); hits.add(2); }
  return [...hits];
}

const t = '关于举办2026全国大学生智能审计技能竞赛的通知';
console.log('EXCLUDE test:', EXCLUDE.test(t));
console.log('hits:', resolveHits(t));
const c88 = CATALOG.find(c => c.no === 88);
console.log('#88 catalog:', JSON.stringify(c88));
console.log('includes core:', t.includes(c88.core));
