// 深挖：点击后 dark 加了又被谁移走？hook classList 看调用栈
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: false });
  const p = await (await b.newContext()).newPage();
  await p.goto('http://127.0.0.1:8931/zongce/index.html', { waitUntil: 'networkidle' });
  const r = await p.evaluate(() => {
    const log = [];
    const origAdd = DOMTokenList.prototype.add;
    const origRemove = DOMTokenList.prototype.remove;
    const origToggle = DOMTokenList.prototype.toggle;
    DOMTokenList.prototype.toggle = function (t, force) {
      if (t === 'dark') log.push('toggle dark force=' + force + ' -> ' + new Error().stack.split('\n')[2].trim().slice(0, 120));
      return origToggle.call(this, t, force);
    };
    DOMTokenList.prototype.add = function (t) {
      if (t === 'dark') log.push('add dark -> ' + new Error().stack.split('\n')[2].trim().slice(0, 120));
      return origAdd.apply(this, arguments);
    };
    DOMTokenList.prototype.remove = function (t) {
      if (t === 'dark') log.push('remove dark -> ' + new Error().stack.split('\n')[2].trim().slice(0, 120));
      return origRemove.apply(this, arguments);
    };
    document.querySelector('.dark-mode-toggle').click();
    return { log, dark: document.body.classList.contains('dark') };
  });
  console.log('dark after click:', r.dark);
  r.log.forEach(l => console.log(' ', l));
  await b.close();
})().catch(e => console.log('ERR', e.message.slice(0, 120)));
