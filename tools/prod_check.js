// 生产环境验证（真实浏览器，绕过 CF 盾对脚本的拦截）
const { chromium } = require('playwright');
const BASE = 'https://ntu-from-lanfanqie-zhaosheng.fypklanfanqie.xyz';
const PAGES = ['/', '/zongce/index.html', '/zongce/calculator.html', '/zongce/tracker.html', '/zongce/other.html'];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 120)));

  for (const p of PAGES) {
    try {
      await page.goto(BASE + p, { waitUntil: 'load', timeout: 45000 });
      await page.waitForTimeout(1500);
      const title = await page.title();
      // CF challenge 检测
      const isChallenge = await page.evaluate(() => !!document.querySelector('#challenge-form, [class*="challenge"]') && document.title.includes('Just a moment'));
      console.log((isChallenge ? 'CHALLENGE' : 'OK'), p, '|', title.slice(0, 40));
      if (p === '/zongce/tracker.html') {
        // 等数据渲染
        await page.waitForTimeout(2000);
        const cards = await page.$$eval('.zc-comp-card', els => els.length);
        const stats = await page.textContent('#stat-total');
        console.log('   tracker 卡片数:', cards, '| 统计:', stats);
      }
      if (p === '/zongce/calculator.html') {
        await page.fill('#comp-input', '机创');
        await page.waitForTimeout(500);
        const n = await page.$$eval('.zc-ac-item', els => els.length);
        console.log('   计算器联想结果:', n);
      }
    } catch (e) {
      console.log('FAIL', p, e.message.slice(0, 80));
      errors.push(p + ' ' + e.message.slice(0, 80));
    }
  }
  await browser.close();
  console.log(errors.length ? 'ERRORS: ' + errors.join(' | ') : 'PROD ALL PASS');
})();
