// 生产环境完整验证（headed 模式过 CF 盾）
const { chromium } = require('playwright');
const BASE = 'https://ntu-from-lanfanqie-zhaosheng.fypklanfanqie.xyz';
const PAGES = ['/', '/zongce/index.html', '/zongce/calculator.html', '/zongce/tracker.html', '/zongce/other.html'];

(async () => {
  const browser = await chromium.launch({ headless: false, args: ['--window-size=1440,900'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 120)));

  // 先过一次 challenge 拿 clearance cookie
  await page.goto(BASE + '/', { waitUntil: 'load', timeout: 60000 });
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(2500);
    const t = await page.title();
    if (!t.includes('Just a moment')) break;
  }
  console.log('clearance obtained, title:', (await page.title()).slice(0, 30));

  for (const p of PAGES) {
    try {
      await page.goto(BASE + p, { waitUntil: 'load', timeout: 45000 });
      await page.waitForTimeout(1800);
      const title = await page.title();
      const challenge = title.includes('Just a moment');
      console.log(challenge ? 'CHALLENGE' : 'OK', p, '|', title.slice(0, 36));
      if (!challenge && p === '/zongce/tracker.html') {
        const cards = await page.$$eval('.zc-comp-card', els => els.length);
        const stats = await page.textContent('#stat-total');
        const links = await page.$$eval('.zc-comp-link', els => els.length);
        console.log('   卡片:', cards, '| 总数统计:', stats, '| 官方链接:', links);
      }
      if (!challenge && p === '/zongce/calculator.html') {
        await page.fill('#comp-input', '机创');
        await page.waitForTimeout(500);
        const n = await page.$$eval('.zc-ac-item', els => els.length);
        console.log('   联想结果数:', n);
      }
      if (!challenge && p === '/zongce/other.html') {
        const tabs = await page.$$eval('.zc-tab', els => els.length);
        const items = await page.$$eval('.zc-bonus-item', els => els.length);
        console.log('   五育tabs:', tabs, '| 德育条目:', items);
      }
    } catch (e) {
      console.log('FAIL', p, e.message.slice(0, 70));
      errors.push(p);
    }
  }
  await browser.close();
  console.log(errors.length ? 'ERRORS on: ' + errors.join(',') : 'PROD ALL PASS');
})();
