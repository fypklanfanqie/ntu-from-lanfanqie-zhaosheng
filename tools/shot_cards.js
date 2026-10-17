const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1440, height: 1200 } })).newPage();
  await p.goto('http://127.0.0.1:8931/zongce/tracker.html', { waitUntil: 'domcontentloaded', timeout: 25000 });
  await p.waitForTimeout(4000);
  // 滚到竞赛卡片区
  await p.evaluate(() => {
    const el = document.querySelector('#comp-grid');
    if (el) el.scrollIntoView({ block: 'start' });
  });
  await p.waitForTimeout(800);
  await p.screenshot({ path: 'tools/shots/tracker-cards.png' });
  // 抓前 3 张卡片文本
  const cards = await p.$$eval('.zc-comp-card', els => els.slice(0, 3).map(e => e.innerText.replace(/\n+/g, ' | ').slice(0, 150)));
  console.log(cards.join('\n---\n'));
  await b.close();
})().catch(e => console.log('ERR', e.message.slice(0, 120)));
