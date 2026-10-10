// 手动触发 Worker 抓取 + 验证 API
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const res = await p.request.post('https://ntu-zongce-fetcher.lanfanqie.workers.dev/api/trigger');
  const j = await res.json();
  console.log('ok:', j.ok);
  if (j.result) {
    console.log('lastBatch:', JSON.stringify(j.result.lastBatch), '| tookMs:', j.result.tookMs, '| items:', j.result.items.length);
    j.result.items.slice(0, 6).forEach(i => console.log(' -', i.date || '?', '|', (i.title || i.error || '').slice(0, 56), '|', i.college || ''));
  } else { console.log(JSON.stringify(j).slice(0, 300)); }

  // 验证 GET API
  const r2 = await p.request.get('https://ntu-zongce-fetcher.lanfanqie.workers.dev/api/notifications');
  const j2 = await r2.json();
  console.log('\nGET /api/notifications → ok:', j2.ok, '| items:', j2.data.items.length, '| updated:', j2.data.updated);
  await b.close();
})().catch(e => console.log('ERR', e.message.slice(0, 120)));
