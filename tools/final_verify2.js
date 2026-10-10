// 最终验证（pages.dev 稳定无盾，与 fypklanfanqie.xyz 同一部署）
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: false });
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const B = 'https://ntu-from-lanfanqie-zhaosheng.pages.dev';

  await p.goto(B + '/zongce/tracker.html', { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(3500);
  console.log('tracker: notify=' + await p.$$eval('#notify-area .zc-card', els => els.length),
    'cards=' + await p.$$eval('.zc-comp-card', els => els.length),
    'links=' + await p.$$eval('.zc-comp-link', els => els.length));

  await p.goto(B + '/zongce/calculator.html', { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(1500);
  await p.fill('#comp-input', 'sxjm');
  await p.waitForTimeout(500);
  console.log('calc 联想(sxjm):', await p.$$eval('.zc-ac-item', els => els.length));

  await p.goto(B + '/zongce/other.html', { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(1500);
  console.log('other tabs:', await p.$$eval('.zc-tab', els => els.length));

  await b.close();
  console.log('FINAL PASS');
})().catch(e => console.log('ERR', e.message.slice(0, 100)));
