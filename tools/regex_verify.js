// 本地验证 Worker 抓取正则（对真实列表页）
const html = require('fs').readFileSync('tools/debug_list.html', 'utf8');
const KEYWORDS = ['竞赛', '大赛', '报名', '选拔赛', '邀请赛', '挑战杯', '模拟', '训练营', 'Chap', '杯', '锦标赛', '创新创业大赛'];
const EXCLUDE = /获奖|成绩公示|获奖名单|结果公示|喜报|获佳绩|斩获|答辩安排|评选结果/;
const linkRe = /<a[^>]+href=["']([^"']+?)["'][^>]*>([\s\S]{6,200}?)<\/a>/g;
const dateRe = /(\d{4})-(\d{2})-(\d{2})/;
const tagRe = /<[^>]+>/g;
let m;
const out = [];
while ((m = linkRe.exec(html)) !== null) {
  const href = m[1];
  const title = m[2].replace(tagRe, '').replace(/\s+/g, ' ').trim();
  if (!/^\/|https?:/.test(href)) continue;
  if (title.length < 6 || title.length > 120) continue;
  if (!KEYWORDS.some(k => title.includes(k))) continue;
  if (EXCLUDE.test(title)) continue;
  const ctx = html.slice(Math.max(0, m.index - 100), m.index + 400);
  const dm = ctx.match(dateRe);
  out.push({ href, title, date: dm ? dm[0] : '' });
}
console.log('抓到', out.length, '条:');
out.forEach(o => console.log(' -', o.date, '|', o.title.slice(0, 62), '|', o.href.slice(0, 44)));
