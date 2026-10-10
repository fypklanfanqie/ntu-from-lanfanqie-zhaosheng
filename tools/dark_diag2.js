const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: false });
  const p = await (await b.newContext()).newPage();
  const bad = [];
  p.on('response', r => { if (r.status() === 404) bad.push(r.url()); });
  p.on('pageerror', e => console.log('PAGEERROR:', e.message.slice(0, 200)));
  await p.goto('http://127.0.0.1:8931/zongce/index.html', { waitUntil: 'networkidle' });
  console.log('404s:', bad);
  const r = await p.evaluate(() => {
    const btn = document.querySelector('.dark-mode-toggle');
    try {
      btn.click();
      return 'clicked, dark=' + document.body.classList.contains('dark');
    } catch (e) { return 'click err: ' + e.message; }
  });
  console.log(r);
  // 再看 localStorage 值
  console.log('storage:', await p.evaluate(() => JSON.stringify({
    ntuDark: localStorage.getItem('ntu-dark'),
    theme: localStorage.getItem('theme')
  })));
  await b.close();
})().catch(e => console.log('ERR', e.message.slice(0, 100)));
