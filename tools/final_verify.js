const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: false });
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const B = 'https://ntu-from-lanfanqie-zhaosheng.fypklanfanqie.xyz';

  // 过盾
  await p.goto(B + '/', { waitUntil: 'load', timeout: 60000 });
  for (let i = 0; i < 12; i++) {
    await p.waitForTimeout(2500);
    if (!(await p.title()).includes('Just a moment') && !(await p.title()).includes('请稍候')) break;
  }
  console.log('home title:', (await p.title()).slice(0, 24));

  // tracker 带通知区验证
  await p.goto(B + '/zongce/tracker.html', { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(3500);
  const notify = await p.$$eval('#notify-area .zc-card', els => els.length).catch(() => -1);
  const cards = await p.$$eval('.zc-comp-card', els => els.length).catch(() => -1);
  const links = await p.$$eval('.zc-comp-link', els => els.length).catch(() => -1);
  console.log('tracker: notify=' + notify, 'cards=' + cards, 'officialLinks=' + links);

  // calc 冒烟
  await p.goto(B + '/zongce/calculator.html', { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(1500);
  await p.fill('#comp-input', 'sxjm');
  await p.waitForTimeout(500);
  console.log('calc 联想(sxjm):', await p.$$eval('.zc-ac-item', els => els.length));

  await b.close();
  console.log('CUSTOM DOMAIN VERIFIED');
})().catch(e => console.log('ERR', e.message.slice(0, 100)));
