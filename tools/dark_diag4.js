const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: false });
  const p = await (await b.newContext()).newPage();
  await p.goto('http://127.0.0.1:8931/zongce/index.html', { waitUntil: 'networkidle' });
  const r = await p.evaluate(() => {
    const steps = [];
    const btn = document.querySelector('.dark-mode-toggle');
    // 拦截每一步
    const origToggle = DOMTokenList.prototype.toggle;
    DOMTokenList.prototype.toggle = function (t, force) {
      const res = origToggle.call(this, t, force);
      if (t === 'dark') steps.push('toggle->' + res + ' contains=' + this.contains('dark'));
      return res;
    };
    btn.click();
    steps.push('after click contains=' + document.body.classList.contains('dark') + ' class=' + document.body.className);
    // 等一个 macrotask，看是否有后续 remove（比如某个 observer / 动画回调）
    return new Promise(resolve => {
      setTimeout(() => {
        steps.push('after 500ms contains=' + document.body.classList.contains('dark') + ' class=' + document.body.className);
        resolve(steps);
      }, 500);
    });
  });
  r.forEach(s => console.log(s));
  await b.close();
})().catch(e => console.log('ERR', e.message.slice(0, 120)));
