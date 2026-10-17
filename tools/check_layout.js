const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.goto('http://127.0.0.1:8931/zongce/calculator.html', { waitUntil: 'domcontentloaded', timeout: 25000 });
  await p.waitForTimeout(1200);
  const r = await p.evaluate(() => {
    const sn = document.querySelector('.zc-source-note');
    const ct = document.querySelector('.zc-container');
    return {
      noteParent: sn ? sn.parentElement.className : 'missing',
      noteLeft: sn ? Math.round(sn.getBoundingClientRect().left) : -1,
      ctLeft: ct ? Math.round(ct.getBoundingClientRect().left) : -1,
      noteWidth: sn ? Math.round(sn.getBoundingClientRect().width) : -1,
    };
  });
  console.log(JSON.stringify(r));
  await p.screenshot({ path: 'tools/shots/calc-full.png' });
  await b.close();
})().catch(e => console.log('ERR', e.message.slice(0, 120)));
