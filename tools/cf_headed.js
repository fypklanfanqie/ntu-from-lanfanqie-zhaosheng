const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: false, args: ['--window-size=1440,900'] });
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.goto('https://ntu-from-lanfanqie-zhaosheng.fypklanfanqie.xyz/', { waitUntil: 'load', timeout: 60000 });
  for (let i = 0; i < 12; i++) {
    await p.waitForTimeout(2500);
    const t = await p.title();
    if (!t.includes('Just a moment')) { console.log('PASSED after ' + ((i + 1) * 2.5) + 's | ' + t); break; }
    if (i === 11) console.log('STILL CHALLENGE');
  }
  await b.close();
})().catch(e => console.log('ERR', e.message.slice(0, 80)));
