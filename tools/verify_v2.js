const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ headless: false });
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(e.message.slice(0, 100)));
  const B = 'http://127.0.0.1:8931';

  // 1. 计算器: 学院联动 + 类别查表
  await p.goto(B + '/zongce/calculator.html', { waitUntil: 'networkidle' });
  await p.selectOption('#college-select', '机械工程学院');
  await p.waitForTimeout(300);
  const classOpts = await p.$$eval('#class-select option', els => els.map(e => e.value));
  console.log('机械学院类别档:', classOpts.join(','));
  await p.fill('#comp-input', '机创');
  await p.waitForTimeout(400);
  await p.click('.zc-ac-item');
  await p.waitForTimeout(200);
  const autoClass = await p.inputValue('#class-select');
  console.log('选"机创"后自动类别:', autoClass, '(期望Ⅰ丙)');
  // 计算: 机械 Ⅰ丙 一等
  await p.selectOption('#prize-select', '1');
  await p.click('#calc-btn');
  await p.waitForTimeout(300);
  console.log('机械Ⅰ丙一等 →', (await p.textContent('.zc-result-score')).trim(), '(期望+6)');
  // 切纺服同条件
  await p.selectOption('#college-select', '纺织服装学院');
  await p.waitForTimeout(300);
  await p.click('#calc-btn');
  await p.waitForTimeout(300);
  console.log('纺服Ⅰ丙一等 →', (await p.textContent('.zc-result-score')).trim(), '(期望+6)');
  // 切商学院 Ⅰ丙一等
  await p.selectOption('#college-select', '商学院（管理学院）');
  await p.waitForTimeout(300);
  await p.click('#calc-btn');
  await p.waitForTimeout(300);
  console.log('商学院Ⅰ丙一等 →', (await p.textContent('.zc-result-score')).trim(), '(期望+3)');

  // 2. 排名字段对齐: 检查 field-author 与其他 field 的 label 基线一致
  const boxes = await p.evaluate(() => {
    const els = ['field-level', 'field-prize', 'field-author'].map(id => {
      const el = document.getElementById(id);
      const r = el.getBoundingClientRect();
      return { id, top: Math.round(r.top), h: Math.round(r.height) };
    });
    return els;
  });
  console.log('字段框对齐:', JSON.stringify(boxes));

  // 3. 暗色模式: zongce 页切换
  await p.goto(B + '/zongce/index.html', { waitUntil: 'networkidle' });
  await p.click('.dark-mode-toggle');
  await p.waitForTimeout(200);
  const d1 = await p.evaluate(() => document.body.classList.contains('dark'));
  await p.click('.dark-mode-toggle');
  await p.waitForTimeout(200);
  const d2 = await p.evaluate(() => document.body.classList.contains('dark'));
  console.log('暗色切换: click1=' + d1 + ' click2=' + d2, '(期望 true/false)');

  // 4. tracker: 三步筛选栏 + 状态映射
  await p.goto(B + '/zongce/tracker.html', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500);
  const steps = await p.$$eval('.zc-filter-step', els => els.length);
  const notify = await p.$$eval('#notify-area .zc-card', els => els.length);
  const openN = await p.textContent('#stat-open');
  const soonN = await p.textContent('#stat-soon');
  console.log('tracker: steps=' + steps, 'notify=' + notify, '可报名=' + openN, '即将=' + soonN);
  // 状态筛选点击
  await p.click('#status-pills [data-status="open"]');
  await p.waitForTimeout(400);
  const visibleCards = await p.$$eval('.zc-comp-card', els => els.length);
  console.log('筛选"可报名"后卡片:', visibleCards);
  // 导航居中检查
  const nav = await p.evaluate(() => {
    const nl = document.querySelector('.nav-links');
    const nb = document.querySelector('.navbar');
    const a = nl.getBoundingClientRect(), b = nb.getBoundingClientRect();
    return { navCenter: Math.round(a.left + a.width / 2), barCenter: Math.round(b.left + b.width / 2) };
  });
  console.log('导航居中:', JSON.stringify(nav), '| 偏差', Math.abs(nav.navCenter - nav.barCenter), 'px');

  await b.close();
  console.log(errs.length ? 'JS ERRORS: ' + errs.join(' | ') : 'ALL PASS');
})().catch(e => console.log('ERR', e.message.slice(0, 120)));
