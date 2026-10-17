const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1440, height: 1000 } })).newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message.slice(0, 120)));
  await p.goto('http://127.0.0.1:8931/zongce/tracker.html', { waitUntil: 'domcontentloaded', timeout: 25000 });
  await p.waitForTimeout(4000);

  // 找 #1 卡片（国创赛）检查是否还有误匹配
  const c1 = await p.evaluate(() => {
    const cards = [...document.querySelectorAll('.zc-comp-card')];
    const card = cards.find(c => c.innerText.includes('中国国际大学生创新大赛'));
    return card ? card.innerText.replace(/\n+/g, ' | ').slice(0, 200) : 'not-found';
  });
  console.log('#1 国创赛卡片:', c1);

  // 选机械学院看 tab
  await p.click('#field-pills [data-field="理"]');
  await p.waitForTimeout(300);
  await p.selectOption('#college-select', '机械工程学院');
  await p.waitForTimeout(800);
  const tabs = await p.$$eval('#notice-pills .zc-pill', els => els.map(e => e.textContent.trim()));
  console.log('tab（学院无通知时应只有2个）:', JSON.stringify(tabs));
  const hint = await p.evaluate(() => {
    const el = document.querySelector('#notify-area');
    return el ? el.innerText.split('\n').slice(0, 4).join(' / ') : '';
  });
  console.log('通知区文案:', hint.slice(0, 120));
  console.log('errors:', errs.length ? errs.join('|') : 'none');
  await b.close();
})().catch(e => console.log('ERR', e.message.slice(0, 130)));
