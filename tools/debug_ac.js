// 排查联想下拉为什么没出现：监听 console + 直接派发 input 事件
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext()).newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERROR: ' + e.message.slice(0, 150)));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text().slice(0, 150)); });
  await p.goto('http://127.0.0.1:8931/zongce/calculator.html', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await p.waitForTimeout(2000);
  await p.click('#comp-input');
  await p.type('#comp-input', '机创', { delay: 50 });
  await p.waitForTimeout(600);
  const state = await p.evaluate(() => ({
    value: document.getElementById('comp-input').value,
    listOpen: document.getElementById('comp-ac-list').classList.contains('open'),
    items: document.querySelectorAll('.zc-ac-item').length,
    listHTML: document.getElementById('comp-ac-list').innerHTML.slice(0, 120)
  }));
  console.log(JSON.stringify(state, null, 1));
  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await b.close();
})().catch(e => console.log('ERR', e.message.slice(0, 120)));
