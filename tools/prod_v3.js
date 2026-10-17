const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: false });
  const p = await (await b.newContext({ viewport: { width: 1440, height: 1000 } })).newPage();
  const B = 'https://ntu-from-lanfanqie-zhaosheng.pages.dev';
  const errs = [];
  p.on('pageerror', e => errs.push(e.message.slice(0, 120)));

  await p.goto(B + '/zongce/tracker.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForTimeout(5000);

  const st = await p.evaluate(() => ({
    open: document.querySelector('#stat-open')?.textContent,
    soon: document.querySelector('#stat-soon')?.textContent,
    updated: document.querySelector('#updated-time')?.textContent,
    notices: document.querySelectorAll('.zc-notice-row').length,
    cards: document.querySelectorAll('.zc-comp-card').length,
  }));
  console.log('生产渲染:', JSON.stringify(st));

  // 点击「推荐」筛选
  await p.click('#status-pills [data-status="recommend"]');
  await p.waitForTimeout(600);
  console.log('推荐筛选后卡片数:', await p.$$eval('.zc-comp-card', e => e.length));

  // 恢复全部，选机械学院，看通知 tab
  await p.click('#status-pills [data-status="all"]');
  await p.click('#field-pills [data-field="理"]');
  await p.waitForTimeout(300);
  await p.selectOption('#college-select', '机械工程学院');
  await p.waitForTimeout(800);
  const tabs = await p.$$eval('#notice-pills .zc-pill', els => els.map(e => e.textContent.trim()));
  console.log('通知tab:', JSON.stringify(tabs));
  const matchN = await p.textContent('#stat-match');
  console.log('机械匹配数:', matchN);
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
  console.log('PROD OK');
})().catch(e => console.log('ERR', e.message.slice(0, 140)));
