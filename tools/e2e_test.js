// 计算器交互 E2E：联想搜索 → 选中 → 计算 → 加清单
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8931';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(BASE + '/zongce/calculator.html', { waitUntil: 'networkidle' });

  // 1. 输入拼音首字母联想
  await page.fill('#comp-input', 'jichuangxin');
  await page.waitForTimeout(300);
  const items = await page.$$eval('.zc-ac-item', els => els.map(e => e.textContent.trim().slice(0, 30)));
  console.log('联想结果数:', items.length, '| 首条:', items[0]);
  if (!items[0] || !items[0].includes('机械创新')) { errors.push('联想首条不是机械创新设计大赛: ' + items[0]); }

  // 2. 点选第一项
  await page.click('.zc-ac-item');
  const val = await page.inputValue('#comp-input');
  console.log('选中后输入框:', val.slice(0, 30));
  if (!val.includes('机械创新')) errors.push('选中失败');

  // 3. 设置级别=国家级 奖次=一等奖 排名=第1作者
  await page.selectOption('#level-select', 'national');
  await page.selectOption('#prize-select', '1');
  await page.selectOption('#author-select', '1');
  await page.click('#calc-btn');
  await page.waitForTimeout(400);
  const score = await page.textContent('.zc-result-score');
  console.log('计算结果:', score.trim());
  if (!score.includes('+5')) errors.push('国赛一等应为+5，实际: ' + score);

  // 4. 加入清单
  await page.click('#add-btn');
  await page.waitForTimeout(300);
  const total = await page.textContent('#total-score');
  console.log('清单合计:', total.trim());
  if (!total.includes('5')) errors.push('清单合计应为5: ' + total);

  // 5. tracker 学院筛选
  await page.goto(BASE + '/zongce/tracker.html', { waitUntil: 'networkidle' });
  await page.click('#field-pills [data-field="理"]');
  await page.waitForTimeout(300);
  await page.selectOption('#college-select', '机械工程学院');
  await page.waitForTimeout(400);
  const matchStat = await page.textContent('#stat-match');
  const firstCard = await page.textContent('.zc-comp-card .zc-comp-name');
  console.log('机械学院匹配数:', matchStat, '| 首卡片:', firstCard);
  if (matchStat.trim() === '0') errors.push('机械学院匹配数异常');
  // 首卡片应是机械承办的竞赛
  const isMech = ['机械创新', '金相', '成图', '三维', '机械工程', '智能机器人', 'CAD'].some(k => firstCard.includes(k));
  if (!isMech) errors.push('首卡片不是机械相关: ' + firstCard);

  // 6. official link 存在
  const linkCnt = await page.$$eval('.zc-comp-link', els => els.length);
  console.log('当前视图官方链接数:', linkCnt);

  await browser.close();
  console.log(errors.length ? 'E2E ERRORS:\n' + errors.join('\n') : 'E2E ALL PASS');
  process.exit(errors.length ? 1 : 0);
})();
