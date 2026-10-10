// Playwright 视觉走查 + 控制台错误收集
const { chromium } = require('playwright');
const path = require('path');

const BASE = 'http://127.0.0.1:8931';
const SHOTS = 'tools/shots';
const fs = require('fs');
fs.mkdirSync(SHOTS, { recursive: true });

const PAGES = [
  { url: '/index.html', name: 'home' },
  { url: '/zongce/index.html', name: 'zc-portal' },
  { url: '/zongce/calculator.html', name: 'zc-calc' },
  { url: '/zongce/tracker.html', name: 'zc-tracker' },
  { url: '/zongce/other.html', name: 'zc-other' },
];

(async () => {
  const browser = await chromium.launch();
  const errors = [];
  for (const vp of [{ name: 'desktop', width: 1440, height: 900 }, { name: 'mobile', width: 390, height: 844 }]) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    for (const p of PAGES) {
      const page = await ctx.newPage();
      page.on('console', (m) => { if (m.type() === 'error') errors.push(`[${vp.name}] ${p.name}: ${m.text()}`); });
      page.on('pageerror', (e) => errors.push(`[${vp.name}] ${p.name} PAGEERROR: ${e.message}`));
      try {
        // 重试 3 次（服务器偶发抖动）
        let ok = false;
        for (let i = 0; i < 3 && !ok; i++) {
          try { await page.goto(BASE + p.url, { waitUntil: 'networkidle', timeout: 15000 }); ok = true; }
          catch (e) { if (i === 2) throw e; await new Promise(r => setTimeout(r, 800)); }
        }
        await page.waitForTimeout(600);
        // 滚动触发 reveal
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.6));
        await page.waitForTimeout(500);
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(300);
        await page.screenshot({ path: `${SHOTS}/${p.name}-${vp.name}.png`, fullPage: false });
        // 暗色模式截图（仅桌面）
        if (vp.name === 'desktop') {
          await page.evaluate(() => document.body.classList.add('dark'));
          await page.waitForTimeout(300);
          await page.screenshot({ path: `${SHOTS}/${p.name}-dark.png` });
        }
      } catch (e) {
        errors.push(`[${vp.name}] ${p.name} NAV: ${e.message.slice(0, 100)}`);
      }
      await page.close();
    }
    await ctx.close();
  }
  await browser.close();
  console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'NO CONSOLE ERRORS');
})();
