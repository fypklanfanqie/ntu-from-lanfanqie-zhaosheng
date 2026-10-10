// 诊断暗色模式按钮：点击后 body.dark 是否生效、是否报错
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: false });
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message.slice(0, 120)));
  p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 120)); });
  await p.goto('http://127.0.0.1:8931/zongce/index.html', { waitUntil: 'load' });
  await p.waitForTimeout(1500);
  // 页面自己的监听（zongce 内联脚本）+ main.js 监听 = 双监听
  const listeners = await p.evaluate(() => {
    // 无法直接数 listener，用 getEventListeners 不可用；改为检测 main.js 是否加载
    return typeof window.initDarkMode !== 'undefined' ? 'main.js global?' : 'no global';
  });
  console.log('main.js global check:', listeners);
  // 点击
  await p.click('.dark-mode-toggle');
  await p.waitForTimeout(300);
  console.log('after click, body.dark =', await p.evaluate(() => document.body.classList.contains('dark')));
  await p.click('.dark-mode-toggle');
  await p.waitForTimeout(300);
  console.log('after 2nd click, body.dark =', await p.evaluate(() => document.body.classList.contains('dark')));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})().catch(e => console.log('ERR', e.message.slice(0, 100)));
