const { chromium } = require('playwright');
(async () => {
  const url = process.argv[2];
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ locale: 'zh-CN' });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(()=>{});
  await page.waitForTimeout(2000);
  const links = await page.evaluate(() => Array.from(document.querySelectorAll('a')).map(a => (a.innerText||'').trim().replace(/\s+/g,' ') + ' => ' + a.getAttribute('href')));
  console.log('TITLE:', await page.title());
  console.log(links.join('\n'));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });