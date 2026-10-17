const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1440, height: 1000 } })).newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message.slice(0, 120)));
  await p.goto('https://ntu-from-lanfanqie-zhaosheng.pages.dev/zongce/calculator.html', { waitUntil: 'domcontentloaded', timeout: 40000 });
  await p.waitForTimeout(1500);

  await p.fill('#comp-input', '蓝桥');
  await p.waitForTimeout(700);
  const n = await p.$$eval('.zc-ac-item', e => e.length);
  if (n) await p.click('.zc-ac-item');
  await p.waitForTimeout(600);

  const s = await p.evaluate(() => {
    const badge = document.querySelector('#class-badge');
    return {
      cls: document.querySelector('#class-select').value,
      badge: badge ? getComputedStyle(badge).display : 'missing',
      hint: document.querySelector('#class-hint').textContent.trim(),
    };
  });
  console.log('生产环境:', JSON.stringify(s));
  console.log('errors:', errs.length ? errs.join('|') : 'none');
  await b.close();
  console.log('PROD OK');
})().catch(e => console.log('ERR', e.message.slice(0, 140)));
