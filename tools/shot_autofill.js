const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 })).newPage();
  await p.goto('http://127.0.0.1:8931/zongce/calculator.html', { waitUntil: 'domcontentloaded', timeout: 25000 });
  await p.waitForTimeout(1200);
  await p.fill('#comp-input', '数学建模');
  await p.waitForTimeout(500);
  await p.click('.zc-ac-item');
  await p.waitForTimeout(700);

  const el = await p.$('#field-class');
  await el.scrollIntoViewIfNeeded();
  await p.waitForTimeout(300);
  const box = await el.boundingBox();
  await p.screenshot({
    path: 'tools/shots/autofill-detail.png',
    clip: { x: Math.max(0, box.x - 30), y: Math.max(0, box.y - 70), width: 700, height: 240 },
  });
  console.log('shot ok');
  await b.close();
})().catch(e => console.log('ERR', e.message.slice(0, 120)));
