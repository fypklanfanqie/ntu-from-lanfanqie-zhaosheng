const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: false });
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const B = 'https://ntu-from-lanfanqie-zhaosheng.pages.dev';

  // 生产验证: 学院联动计算
  await p.goto(B + '/zongce/calculator.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForTimeout(2000);
  await p.selectOption('#college-select', '机械工程学院');
  await p.fill('#comp-input', '机创');
  await p.waitForTimeout(500);
  await p.click('.zc-ac-item');
  await p.waitForTimeout(200);
  await p.selectOption('#prize-select', '1');
  await p.click('#calc-btn');
  await p.waitForTimeout(400);
  console.log('生产·机械Ⅰ丙一等:', (await p.textContent('.zc-result-score')).trim(), '(期望+6)');
  const quick = await p.textContent('#quick-rule-name');
  console.log('速查规则:', quick.slice(0, 22));

  // 暗色
  await p.click('.dark-mode-toggle');
  await p.waitForTimeout(300);
  console.log('生产·暗色切换:', await p.evaluate(() => document.body.classList.contains('dark')));

  // tracker
  await p.goto(B + '/zongce/tracker.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForTimeout(3500);
  console.log('生产·tracker:', 'notify=' + await p.$$eval('#notify-area .zc-card', e => e.length),
    'cards=' + await p.$$eval('.zc-comp-card', e => e.length),
    'open=' + await p.textContent('#stat-open'));

  // other 无金山文档链接
  await p.goto(B + '/zongce/other.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForTimeout(1500);
  console.log('生产·金山文档跳转存在:', await p.$$eval('a[href*="kdocs"]', e => e.length), '(期望0)');

  await b.close();
  console.log('PROD V2 PASS');
})().catch(e => console.log('ERR', e.message.slice(0, 120)));
