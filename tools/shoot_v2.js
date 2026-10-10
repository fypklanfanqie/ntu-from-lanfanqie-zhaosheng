const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.goto('http://127.0.0.1:8931/zongce/calculator.html', { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  await p.screenshot({ path: 'tools/shots/calc-v2.png' });
  await p.goto('http://127.0.0.1:8931/zongce/tracker.html', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500);
  await p.screenshot({ path: 'tools/shots/tracker-v2.png' });
  await p.evaluate(() => document.body.classList.add('dark'));
  await p.waitForTimeout(400);
  await p.screenshot({ path: 'tools/shots/tracker-v2-dark.png' });
  await b.close();
  console.log('shots done');
})().catch(e => console.log('ERR', e.message.slice(0, 100)));
