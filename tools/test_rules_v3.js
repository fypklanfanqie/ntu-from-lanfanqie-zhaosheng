const R = require('../js/zongce-rules.js');
let pass = 0, fail = 0;
const t = (name, cond, extra) => {
  if (cond) { pass++; console.log('  ok -', name); }
  else { fail++; console.log('  FAIL -', name, extra || ''); }
};

console.log('[体育科学学院]');
t('Ⅰ类特等=5 一等=4.5', R.calculate({ category: 'contest', college: '体育科学学院', compClass: 'Ⅰ', prize: 2 }).score === 4.5);
t('Ⅱ类二等 = 3', R.calculate({ category: 'contest', college: '体育科学学院', compClass: 'Ⅱ', prize: 2 }).score === 3);
t('集体第2人 ×0.2: Ⅰ类一等 4.5×0.2=0.9', R.calculate({ category: 'contest', college: '体育科学学院', compClass: 'Ⅰ', prize: 2, authorRank: 2 }).score === 0.9);
t('CET6 = 2.5', R.calculate({ category: 'cet', college: '体育科学学院', cetType: 'cet6' }).score === 2.5);
t('计算机二级 = 2', R.calculate({ category: 'ncre', college: '体育科学学院' }).score === 2);

console.log('[文学院]');
t('Ⅰ类国家级一等 = 5', R.calculate({ category: 'contest', college: '文学院', compClass: 'Ⅰ', level: 'national', prize: 1 }).score === 5);
t('Ⅱ类校级二等 = 0.2', R.calculate({ category: 'contest', college: '文学院', compClass: 'Ⅱ', level: 'school', prize: 2 }).score === 0.2);
t('集体主持×0.6: Ⅰ类国一 = 3', R.calculate({ category: 'contest', college: '文学院', compClass: 'Ⅰ', level: 'national', prize: 1, authorRank: 1 }).score === 3);
t('集体成员×0.4: Ⅰ类国一 = 2', R.calculate({ category: 'contest', college: '文学院', compClass: 'Ⅰ', level: 'national', prize: 1, authorRank: 2 }).score === 2);
t('CET6 = 1', R.calculate({ category: 'cet', college: '文学院', cetType: 'cet6' }).score === 1);
t('大创国家级立项主持×0.6 = 0.9', R.calculate({ category: 'innovation', college: '文学院', innoStage: 'national-setup', authorRank: 1 }).score === 0.9);

console.log('[商学院]');
t('Ⅰ类甲一等 = 5', R.calculate({ category: 'contest', college: '商学院（管理学院）', compClass: 'Ⅰ甲', prize: 1 }).score === 5);
t('Ⅱ类二等 = 1.5', R.calculate({ category: 'contest', college: '商学院（管理学院）', compClass: 'Ⅱ乙', prize: 2 }).score === 1.5);
t('集体第2人×0.25: Ⅰ甲一等 2.5', R.calculate({ category: 'contest', college: '商学院（管理学院）', compClass: 'Ⅰ甲', prize: 1, authorRank: 2 }).score === 1.25);
t('CET6 = 1.5', R.calculate({ category: 'cet', college: '商学院（管理学院）', cetType: 'cet6' }).score === 1.5);
t('计算机三级 = 3', R.calculate({ category: 'ncre', college: '商学院（管理学院）', ncreLevel: 3 }).score === 2);

console.log('[回归: 已有学院不破坏]');
t('机械 Ⅰ丙一等 = 6', R.calculate({ category: 'contest', college: '机械工程学院', compClass: 'Ⅰ丙', prize: 1 }).score === 6);
t('纺服 Ⅰ甲二等 = 8', R.calculate({ category: 'contest', college: '纺织服装学院', compClass: 'Ⅰ甲', prize: 2 }).score === 8);
t('地理 Ⅰ甲二等 = 7.5', R.calculate({ category: 'contest', college: '地理科学学院', compClass: 'Ⅰ甲', prize: 2 }).score === 7.5);
t('学校办法仍在', R.calculate({ category: 'contest', level: 'school', prize: 3 }).score === 0.2);

console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
