const { chromium } = require('playwright');
(async () => {
  const url = process.argv[2];
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ locale: 'zh-CN' });
  const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(e => null);
  await page.waitForTimeout(2500);
  const title = await page.title();
  const text = await page.evaluate(() => document.body.innerText);
  console.log('STATUS:', resp ? resp.status() : 'n/a');
  console.log('TITLE:', title);
  console.log('----- TEXT -----');
  console.log(text);
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });