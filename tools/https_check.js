const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const tests = ['https://www.gcxl.edu.cn/', 'https://www.smartcarrace.com/', 'https://www.chengtudasai.com/', 'https://cmes-imic.org.cn/', 'https://www.nactrans.net/', 'https://www.structurecontest.com/'];
  for (const u of tests) {
    const p = await (await b.newContext()).newPage();
    try {
      await p.goto(u, { waitUntil: 'domcontentloaded', timeout: 20000 });
      console.log('OK ', u, '|', (await p.title()).slice(0, 36));
    } catch (e) {
      console.log('BAD', u, e.message.slice(0, 60));
    }
    await p.close();
  }
  await b.close();
})();
