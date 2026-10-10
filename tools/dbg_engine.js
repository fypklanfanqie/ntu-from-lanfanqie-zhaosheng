const R = require('../js/zongce-rules.js');
console.log('start');
const r = R.calculate({ category: 'contest', level: 'national', prize: 3, authorRank: 2 });
console.log('ok1', r.score);
const r2 = R.calculate({ category: 'contest', college: '机械工程学院', compClass: 'Ⅰ丙', prize: 1, authorRank: 2 });
console.log('ok2', r2.score);
const r3 = R.calculate({ category: 'sport', college: '机械工程学院', level: 'provincial', rank: 8 });
console.log('ok3', r3.score);
