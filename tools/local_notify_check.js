const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: false });
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message.slice(0, 80)));
  await p.goto('http://127.0.0.1:8931/zongce/tracker.html', { waitUntil: 'load', timeout: 30000 });
  await p.waitForTimeout(3000);
  const notify = await p.$$eval('#notify-area .zc-card', els => els.length).catch(() => -1);
  const cards = await p.$$eval('.zc-comp-card', els => els.length).catch(() => -1);
  console.log('notify blocks:', notify, '| cards:', cards, '| pageerrors:', errs.length ? errs.join(';') : 'none');
  await b.close();
})().catch(e => console.log('ERR', e.message.slice(0, 100)));
