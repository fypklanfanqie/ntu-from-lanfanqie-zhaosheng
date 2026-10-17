const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: 'dark', deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message.slice(0, 120)));
  await p.goto('http://127.0.0.1:8931/zongce/calculator.html', { waitUntil: 'domcontentloaded', timeout: 25000 });
  await p.waitForTimeout(1500);
  await p.fill('#comp-input', '蓝桥');
  await p.waitForTimeout(600);
  const items = await p.$$eval('.zc-ac-item .zc-ac-name', els => els.map(e => e.textContent.trim()));
  if (items.length) { await p.click('.zc-ac-item'); }
  await p.waitForTimeout(700);
  const el = await p.$('#field-class');
  await el.scrollIntoViewIfNeeded();
  await p.waitForTimeout(300);
  const box = await el.boundingBox();
  await p.screenshot({ path: 'tools/shots/autofill-dark.png', clip: { x: Math.max(0, box.x - 30), y: Math.max(0, box.y - 70), width: 700, height: 240 } });
  const st = await p.evaluate(() => ({
    dark: document.body.classList.contains('dark'),
    cls: document.querySelector('#class-select').value,
    hint: document.querySelector('#class-hint').textContent.trim(),
  }));
  console.log(JSON.stringify(st), '| errors:', errs.length ? errs.join('|') : 'none');
  await b.close();
})().catch(e => console.log('ERR', e.message.slice(0, 120)));
