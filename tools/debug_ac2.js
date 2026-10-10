const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext()).newPage();
  p.on('pageerror', e => console.log('PAGEERROR:', (e.stack || e.message).split('\n').slice(0, 5).join(' || ').slice(0, 500)));
  await p.goto('http://127.0.0.1:8931/zongce/calculator.html', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(1500);
  await p.click('#comp-input');
  await p.type('#comp-input', '机创', { delay: 50 });
  await p.waitForTimeout(800);
  const state = await p.evaluate(() => ({
    open: document.getElementById('comp-ac-list').classList.contains('open'),
    items: document.querySelectorAll('.zc-ac-item').length
  }));
  console.log('list:', JSON.stringify(state));
  await b.close();
})().catch(e => console.log('ERR', e.message.slice(0, 120)));
