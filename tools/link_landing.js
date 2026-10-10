// 检查这些站点渲染出来是登录页还是主站（用户抱怨的核心）
const { chromium } = require('playwright');
const URLS = [
  ['cy.ncss.cn', 'https://cy.ncss.cn/'],
  ['umic.moocollege', 'https://umic.moocollege.com/'],
  ['robotcontest', 'https://www.robotcontest.cn/'],
  ['chengtudasai', 'http://www.chengtudasai.com/'],
  ['3dds', 'https://3dds.3ddl.net/'],
  ['jsjds.blcu', 'https://jsjds.blcu.edu.cn/'],
  ['zgs.chsi', 'https://zgs.chsi.com.cn/'],
  ['smartcarrace', 'http://www.smartcarrace.com/'],
  ['gcxl.edu.cn', 'http://www.gcxl.edu.cn/'],
  ['siemenscup', 'http://www.siemenscup-cimc.org.cn/'],
];
(async () => {
  const b = await chromium.launch({ headless: true });
  for (const [name, url] of URLS) {
    const p = await (await b.newContext()).newPage();
    try {
      await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
      await p.waitForTimeout(2500);
      const info = await p.evaluate(() => ({
        title: document.title.slice(0, 40),
        hasLoginForm: !!document.querySelector('input[type="password"]'),
        bodyText: document.body.innerText.slice(0, 80).replace(/\s+/g, ' ')
      }));
      console.log(name.padEnd(18), '|', info.title.padEnd(42), '| pwd-form:', info.hasLoginForm, '|', info.bodyText.slice(0, 50));
    } catch (e) {
      console.log(name.padEnd(18), '| ERR', e.message.slice(0, 60));
    }
    await p.close();
  }
  await b.close();
})();
