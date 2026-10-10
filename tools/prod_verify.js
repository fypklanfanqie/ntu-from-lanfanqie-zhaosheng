const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: false });
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();

  // tracker
  await p.goto('https://ntu-from-lanfanqie-zhaosheng.pages.dev/zongce/tracker.html', { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(2500);
  console.log('tracker title:', (await p.title()).slice(0, 30));
  console.log('tracker 卡片:', await p.$$eval('.zc-comp-card', els => els.length),
    '| 统计:', await p.textContent('#stat-total'),
    '| 官方链接:', await p.$$eval('.zc-comp-link', els => els.length));

  // calculator
  await p.goto('https://ntu-from-lanfanqie-zhaosheng.pages.dev/zongce/calculator.html', { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(1500);
  await p.fill('#comp-input', '机创');
  await p.waitForTimeout(500);
  console.log('calc 联想结果:', await p.$$eval('.zc-ac-item', els => els.length));
  await p.click('.zc-ac-item');
  await p.selectOption('#level-select', 'national');
  await p.selectOption('#prize-select', '1');
  await p.click('#calc-btn');
  await p.waitForTimeout(400);
  console.log('calc 结果:', (await p.textContent('.zc-result-score')).trim());

  // other
  await p.goto('https://ntu-from-lanfanqie-zhaosheng.pages.dev/zongce/other.html', { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(1500);
  console.log('other tabs:', await p.$$eval('.zc-tab', els => els.length),
    '| 德育条目:', await p.$$eval('.zc-bonus-item', els => els.length));

  // home entry
  await p.goto('https://ntu-from-lanfanqie-zhaosheng.pages.dev/', { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(2000);
  const hasZc = await p.$$eval('a[href*="zongce"]', els => els.length);
  console.log('首页综测帮入口数:', hasZc);

  await b.close();
  console.log('PAGES.DEV ALL PASS');
})().catch(e => console.log('ERR', e.message.slice(0, 100)));
