const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.goto('https://ntu-from-lanfanqie-zhaosheng.fypklanfanqie.xyz/', { waitUntil: 'load', timeout: 60000 });
  for (let i = 0; i < 10; i++) {
    await p.waitForTimeout(3000);
    const t = await p.title();
    if (!t.includes('Just a moment')) { console.log('passed challenge after ' + ((i + 1) * 3) + 's | ' + t); break; }
    if (i === 9) console.log('still challenge after 30s');
  }
  await b.close();
})().catch(e => console.log('ERR', e.message.slice(0, 100)));
