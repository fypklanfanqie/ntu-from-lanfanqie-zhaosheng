/**
 * Worker 本地端到端模拟：mock fetch + KV，跑真实源码
 * 用法: node tools/run_worker_local.js
 */
const fs = require('fs');
const path = require('path');

/* ---------- 1. 加载 Worker 源码（转 CJS） ---------- */
function loadWorker() {
  let src = fs.readFileSync('worker/src/index.js', 'utf8');
  // 去掉 import，内联 catalog
  src = src.replace(/import \{ CATALOG, ALIASES \} from '\.\/catalog\.js';/, '');
  const cat = fs.readFileSync('worker/src/catalog.js', 'utf8').replace(/export const/g, 'const');
  src = cat + '\n' + src;
  src = src.replace(/export default/, 'module.exports =');
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', src)(mod, mod.exports, require);
  return mod.exports;
}

/* ---------- 2. mock 网络 + KV ---------- */
const cache = {};
function mockFetch(url) {
  // 用本地预抓样本，避免测试依赖网络
  if (cache[url]) return Promise.resolve({ ok: true, text: () => Promise.resolve(cache[url]) });
  return Promise.reject(new Error('no-mock:' + url));
}
global.fetch = (url) => mockFetch(String(url));

const kv = new Map();
const env = {
  ZC_KV: {
    async get(k, type) {
      const v = kv.has(k) ? kv.get(k) : null;
      if (v == null) return null;
      if (type === 'json') { try { return JSON.parse(v); } catch (e) { return null; } }
      return v;
    },
    async put(k, v) { kv.set(k, v); },
  },
};

/* ---------- 3. 准备样本 ---------- */
// 列表页样本：真实抓取保存
const listSample = fs.readFileSync('tools/debug_list.html', 'utf8');
cache['https://cxcyxy.ntu.edu.cn/10412/list.htm'] = listSample;
cache['https://cxcyxy.ntu.edu.cn/10412/list2.htm'] = listSample;
cache['https://cxcyxy.ntu.edu.cn/10412/list3.htm'] = listSample;

// 详情页样本：数学建模竞赛通知（含报名截止 2026-08-01）
const detail = `<html><body><div class="wp_articlecontent">
<p>关于举办2026年南通大学大学生数学建模竞赛的通知</p>
<p>三、竞赛报名 报名截止时间： 2026 年 8 月 1 日上午 10:00</p>
<p>报名方式：【腾讯文档】2026 南通大学数学建模竞赛报名表
<a href="https://docs.qq.com/form/page/DU1Bwc29abHB5Q2V4">报名表</a></p>
</div></body></html>`;
['/2026/0714/c10412a295729/page.htm', '/2026/0924/c10412a299625/page.htm', '/2026/0710/c10412a295140/page.htm',
 '/2026/0626/c10412a294073/page.htm', '/2026/0626/c10412a294072/page.htm'].forEach(p => {
  cache['https://cxcyxy.ntu.edu.cn' + p] = detail;
});

/* ---------- 4. 运行 ---------- */
(async () => {
  const worker = loadWorker();
  console.log('worker loaded, exports:', Object.keys(worker));

  const fakeCtx = { waitUntil(p) { return p; } };
  const req = new Request('https://w/api/trigger?full=1', { method: 'POST' });
  // 用 fetch handler 触发全量
  const res = await worker.fetch(req, env, fakeCtx);
  const body = await res.json();

  console.log('\n=== 抓取结果 ===');
  console.log('ok:', body.ok, '| tookMs:', body.result.tookMs);
  console.log('sources:', JSON.stringify(body.result.stats.sources));
  console.log('errors:', JSON.stringify(body.result.stats.errors));
  console.log('total notices:', body.result.stats.total, '| matched:', body.result.stats.matched,
    '| open:', body.result.stats.open, '| soon:', body.result.stats.soon, '| closed:', body.result.stats.closed);

  console.log('\n=== 通知列表 ===');
  body.result.items.forEach(i => {
    console.log(' ', i.date, '|', (i.status || '?').padEnd(6), '|', (i.deadline || '-').padEnd(10), '|',
      (i.regUrl ? '有报名入口' : '无入口').padEnd(6), '|', i.title.slice(0, 40));
  });

  console.log('\n=== 竞赛匹配 ===');
  const m = await (await worker.fetch(new Request('https://w/api/matches'), env, fakeCtx)).json();
  Object.entries(m.data.matches).forEach(([no, v]) => {
    console.log(' #' + no, '|', v.status.padEnd(6), '| deadline:', v.deadline || '-', '|', v.notice.title.slice(0, 40));
    if (v.notice.regUrl) console.log('      报名入口:', v.notice.regUrl, '(' + v.notice.regLabel + ')');
  });
  console.log('\nKV keys:', [...kv.keys()]);
})().catch(e => { console.error('FAIL', e); process.exit(1); });
