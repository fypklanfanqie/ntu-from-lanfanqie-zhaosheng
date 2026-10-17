const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 1440, height: 1100 } })).newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message.slice(0, 140)));
  await p.goto('http://127.0.0.1:8931/zongce/calculator.html', { waitUntil: 'domcontentloaded', timeout: 25000 });
  await p.waitForTimeout(1500);

  async function readState(label) {
    const s = await p.evaluate(() => {
      const badge = document.querySelector('#class-badge');
      const hint = document.querySelector('#class-hint');
      return {
        cls: document.querySelector('#class-select') ? document.querySelector('#class-select').value : '',
        badge: badge ? (getComputedStyle(badge).display + '|' + (badge.textContent || '').trim()) : 'missing',
        hint: hint ? hint.textContent.trim() : '',
      };
    });
    console.log(label, '→ 类别=' + s.cls, '| 徽标=' + s.badge, '|', s.hint.slice(0, 74));
    return s;
  }

  await readState('初始');

  // 选择"数学建模"（Ⅰ类甲? 实际 #4 = Ⅰ类? 用搜索）
  await p.fill('#comp-input', '数学建模');
  await p.waitForTimeout(500);
  const items = await p.$$eval('.zc-ac-item .zc-ac-name', els => els.map(e => e.textContent.trim()));
  console.log('联想结果:', JSON.stringify(items.slice(0, 3)));
  await p.click('.zc-ac-item');
  await p.waitForTimeout(500);
  await readState('选中国赛数学建模后');

  // 手动改类别 → 应提示"已手动调整"
  await p.selectOption('#class-select', 'Ⅲ乙');
  await p.waitForTimeout(300);
  await readState('手动改为Ⅲ乙');

  // 换学院（机械）→ 应重新自动填入
  await p.selectOption('#college-select', '机械工程学院');
  await p.waitForTimeout(500);
  await readState('切换到机械工程学院后');

  // 清空输入 → 复位
  await p.fill('#comp-input', '');
  await p.waitForTimeout(400);
  await readState('清空输入后');

  // 再测一个类别档位少的学院（体育科学学院 + 体育类竞赛）
  await p.selectOption('#college-select', '体育科学学院');
  await p.waitForTimeout(400);
  await p.fill('#comp-input', '田径');
  await p.waitForTimeout(500);
  const it2 = await p.$$eval('.zc-ac-item .zc-ac-name', els => els.map(e => e.textContent.trim()));
  if (it2.length) { await p.click('.zc-ac-item'); await p.waitForTimeout(400); await readState('体育学院+田径'); }

  console.log('errors:', errs.length ? errs.join(' | ') : 'none');
  await p.screenshot({ path: 'tools/shots/calc-autofill.png' });
  await b.close();
})().catch(e => console.log('ERR', e.message.slice(0, 150)));
