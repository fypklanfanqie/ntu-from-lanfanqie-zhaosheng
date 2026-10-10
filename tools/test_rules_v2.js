const R = require('../js/zongce-rules.js');
let pass = 0, fail = 0;
const t = (name, cond, extra) => {
  if (cond) { pass++; console.log('  ok -', name); }
  else { fail++; console.log('  FAIL -', name, extra || ''); }
};

console.log('[学校办法]');
t('校级三等 +0.2', R.calculate({ category: 'contest', level: 'school', prize: 3 }).score === 0.2);
t('省二等 +1.5', R.calculate({ category: 'contest', level: 'provincial', prize: 2 }).score === 1.5);

console.log('[机械学院 · 认定类别查表]');
t('Ⅰ类丙一等 = 6', R.calculate({ category: 'contest', college: '机械工程学院', compClass: 'Ⅰ丙', prize: 1, authorRank: 0 }).score === 6);
t('Ⅰ类甲二等 = 9', R.calculate({ category: 'contest', college: '机械工程学院', compClass: 'Ⅰ甲', prize: 2, authorRank: 0 }).score === 9);
t('Ⅲ类乙四等 = 0.3', R.calculate({ category: 'contest', college: '机械工程学院', compClass: 'Ⅲ乙', prize: 4, authorRank: 0 }).score === 0.3);
t('Ⅰ类丙三等 第2人 ×0.5 = 2', R.calculate({ category: 'contest', college: '机械工程学院', compClass: 'Ⅰ丙', prize: 3, authorRank: 2 }).score === 2);
t('Ⅰ类丙三等 第3人 ×0.25 = 1', R.calculate({ category: 'contest', college: '机械工程学院', compClass: 'Ⅰ丙', prize: 3, authorRank: 3 }).score === 1);
t('个人(0)不折算 Ⅰ丁二等 = 4', R.calculate({ category: 'contest', college: '机械工程学院', compClass: 'Ⅰ丁', prize: 2, authorRank: 0 }).score === 4);

console.log('[机械学院 · 其他]');
t('体育省级第1 = 4', R.calculate({ category: 'sport', college: '机械工程学院', level: 'provincial', rank: 1 }).score === 4);
t('体育院级第3 = 0.8', R.calculate({ category: 'sport', college: '机械工程学院', level: 'college', rank: 3 }).score === 0.8);
t('体育院级第1 = 0（细则仅2-4名）', R.calculate({ category: 'sport', college: '机械工程学院', level: 'college', rank: 1 }).score === 0);
t('大创国家级结题 第2人 ×0.5 = 1', R.calculate({ category: 'innovation', college: '机械工程学院', innoStage: 'national-finish', authorRank: 2 }).score === 1);
t('院级表彰 = 0.2', R.calculate({ category: 'award', college: '机械工程学院', level: 'college' }).score === 0.2);
t('六级 = 1', R.calculate({ category: 'cet', college: '机械工程学院', cetType: 'cet6' }).score === 1);

console.log('[纺织服装学院]');
t('Ⅰ类甲一等 = 10', R.calculate({ category: 'contest', college: '纺织服装学院', compClass: 'Ⅰ甲', prize: 1 }).score === 10);
t('Ⅰ类甲二等 = 8（与机械不同表）', R.calculate({ category: 'contest', college: '纺织服装学院', compClass: 'Ⅰ甲', prize: 2 }).score === 8);
t('Ⅱ类乙一等 = 3（机械是2）', R.calculate({ category: 'contest', college: '纺织服装学院', compClass: 'Ⅱ乙', prize: 1 }).score === 3);
t('Ⅲ类乙二等 = 1.5', R.calculate({ category: 'contest', college: '纺织服装学院', compClass: 'Ⅲ乙', prize: 2 }).score === 1.5);
t('六级 = 0.5（与机械1不同）', R.calculate({ category: 'cet', college: '纺织服装学院', cetType: 'cet6' }).score === 0.5);
t('体育院级第1 = 1.8', R.calculate({ category: 'sport', college: '纺织服装学院', level: 'college', rank: 1 }).score === 1.8);
t('大创国家立项（仅主持）第1 = 0.5', R.calculate({ category: 'innovation', college: '纺织服装学院', innoStage: 'national-setup', authorRank: 1 }).score === 0.5);

console.log('[地理科学学院 · 系数制]');
t('Ⅰ类甲一等 = 10', R.calculate({ category: 'contest', college: '地理科学学院', compClass: 'Ⅰ甲', prize: 1 }).score === 10);
t('Ⅰ类甲二等 ×0.75 = 7.5', R.calculate({ category: 'contest', college: '地理科学学院', compClass: 'Ⅰ甲', prize: 2 }).score === 7.5);
t('Ⅰ类甲三等 ×0.5 = 5', R.calculate({ category: 'contest', college: '地理科学学院', compClass: 'Ⅰ甲', prize: 3 }).score === 5);
t('Ⅰ类甲四等 ×0.4 = 4', R.calculate({ category: 'contest', college: '地理科学学院', compClass: 'Ⅰ甲', prize: 4 }).score === 4);
t('成员按分值/排名: 第3人 = 10/3', Math.abs(R.calculate({ category: 'contest', college: '地理科学学院', compClass: 'Ⅰ甲', prize: 1, authorRank: 3 }).score - 3.33) < 0.01);
t('六级 = 1.5', R.calculate({ category: 'cet', college: '地理科学学院', cetType: 'cet6' }).score === 1.5);
t('体育院级第1 = 1.5', R.calculate({ category: 'sport', college: '地理科学学院', level: 'college', rank: 1 }).score === 1.5);

console.log('[物理学院]');
t('Ⅰ类甲一等 = 10', R.calculate({ category: 'contest', college: '物理科学与技术学院', compClass: 'Ⅰ甲', prize: 1 }).score === 10);
t('六级 = 1.5', R.calculate({ category: 'cet', college: '物理科学与技术学院', cetType: 'cet6' }).score === 1.5);
t('国家级表彰 = 4（与学校5不同）', R.calculate({ category: 'award', college: '物理科学与技术学院', level: 'national' }).score === 4);

console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
