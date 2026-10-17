const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message.slice(0, 160)));
  p.on('console', m => { if (m.type() === 'error') errs.push('C:' + m.text().slice(0, 100)); });

  await p.goto('http://127.0.0.1:8931/zongce/tracker.html', { waitUntil: 'domcontentloaded', timeout: 25000 });
  await p.waitForTimeout(4000); // 等 API/快照

  const st = await p.evaluate(() => ({
    noticeRows: document.querySelectorAll('.zc-notice-row').length,
    cards: document.querySelectorAll('.zc-comp-card').length,
    open: document.querySelector('#stat-open')?.textContent,
    soon: document.querySelector('#stat-soon')?.textContent,
    updated: document.querySelector('#updated-time')?.textContent,
    evidence: document.querySelectorAll('.zc-comp-note').length,
  }));
  console.log('渲染状态:', JSON.stringify(st));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');

  // 选学院 → 通知区出现"我的学院"tab
  await p.click('#field-pills [data-field="理"]');
  await p.waitForTimeout(300);
  await p.selectOption('#college-select', '机械工程学院');
  await p.waitForTimeout(600);
  const tabs = await p.$$eval('#notice-pills .zc-pill', els => els.map(e => e.textContent.trim()));
  console.log('通知筛选tab:', JSON.stringify(tabs));
  await p.screenshot({ path: 'tools/shots/tracker-v3.png' });

  await b.close();
})().catch(e => console.log('ERR', e.message.slice(0, 140)));
