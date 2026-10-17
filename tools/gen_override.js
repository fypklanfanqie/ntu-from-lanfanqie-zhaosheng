/**
 * 把官网核验结果 JSON 转成 js/competition-status-override.js
 * 用法: node tools/gen_override.js <results.json>
 * 输入: [{"no":100,"name":"蓝桥杯","status":"open","deadline":"...","evidence":"...","url":"...","checkedAt":"2026-10-17"}]
 */
const fs = require('fs');

const file = process.argv[2];
if (!file) { console.error('用法: node tools/gen_override.js <results.json>'); process.exit(1); }

const rows = JSON.parse(fs.readFileSync(file, 'utf8')).flat ? JSON.parse(fs.readFileSync(file, 'utf8')).flat() : JSON.parse(fs.readFileSync(file, 'utf8'));
const comps = require('../js/competitions-data.js');
const byNo = {}; comps.forEach(c => byNo[c.no] = c);

const out = {};
const skipped = [];
for (const r of rows) {
  const no = parseInt(r.no, 10);
  if (!no || !byNo[no]) { skipped.push(r.no + ' (目录无此编号)'); continue; }
  if (!['open', 'soon', 'closed'].includes(r.status)) { skipped.push(no + ' (status=' + r.status + ')'); continue; }
  if (!r.evidence) { skipped.push(no + ' (无证据)'); continue; }
  out[no] = {
    status: r.status,
    deadline: r.deadline && /^\d{4}-\d{2}-\d{2}$/.test(r.deadline) ? r.deadline : '',
    evidence: String(r.evidence).slice(0, 70),
    url: r.url || '',
    checkedAt: r.checkedAt || new Date().toISOString().slice(0, 10),
  };
}

const js = `/* ================================================================
   竞赛报名状态 · 官网核验覆盖表（自动生成 tools/gen_override.js）
   ----------------------------------------------------------------
   来源：人工核验各竞赛官网/官方公告，记录核验时的报名状态
   规则：checkedAt 超过 60 天自动降级；与校内通知冲突时取更乐观状态
   生成时间：${new Date().toISOString()}
   ================================================================ */
(function (global) {
'use strict';
global.NTU_STATUS_OVERRIDE = ${JSON.stringify(out, null, 2)};
if (typeof module !== 'undefined') module.exports = global.NTU_STATUS_OVERRIDE;
})(typeof window !== 'undefined' ? window : globalThis);
`;
fs.writeFileSync('js/competition-status-override.js', js);

const cnt = { open: 0, soon: 0, closed: 0 };
Object.values(out).forEach(v => cnt[v.status]++);
console.log('写入', Object.keys(out).length, '条覆盖:', JSON.stringify(cnt));
if (skipped.length) console.log('跳过:', skipped.join(', '));
Object.entries(out).forEach(([no, v]) => console.log(' #' + no, byNo[no].name.slice(0, 22), '→', v.status, v.deadline || '', '|', v.evidence.slice(0, 40)));
