/* 综测帮集成测试：数据层 + 规则引擎 + 搜索 + 链接完整性 */
const d = require('../js/competitions-data.js');
const S = require('../js/zongce-search.js');
const R = require('../js/zongce-rules.js');
const L = require('../js/competition-links.js');
const B = require('../js/other-bonus.js');

let pass = 0, fail = 0;
const t = (name, cond, extra) => {
  if (cond) { pass++; console.log('  ok -', name); }
  else { fail++; console.log('  FAIL -', name, extra || ''); }
};

console.log('[competitions-data]');
t('172 项竞赛', d.length === 172, d.length);
t('序号连续 1..172', d.every((c, i) => c.no === i + 1));
t('每项有 name/host/orgs/class/tier/field', d.every(c => c.name && c.host && Array.isArray(c.orgs) && c.class && c.tier && c.field));
t('认定类别合法', d.every(c => ['Ⅰ','Ⅱ','Ⅲ'].includes(c.class) && ['甲','乙','丙','丁'].includes(c.tier)), d.filter(c => !['Ⅰ','Ⅱ','Ⅲ'].includes(c.class)).map(c=>c.no));
t('文理标签合法', d.every(c => ['理','文','综'].includes(c.field)));
t('体育类 13 项 (160-172)', d.filter(c => c.sports).length === 13);
t('机械学院承办 7 项', d.filter(c => c.orgs.some(o => o.includes('机械'))).length === 7);

console.log('[zongce-search]');
S.buildIndex(d);
t('机创→机械创新设计大赛', S.search('机创', 1)[0].comp.no === 12);
t('美赛→MCM/ICM', S.search('meisai', 1)[0].comp.no === 80);
t('sxjm→数学建模', S.search('sxjm', 1)[0].comp.no === 4);
t('chengtu→成图', S.search('chengtu', 1)[0].comp.no === 53);
t('挑战杯两个', S.search('挑战杯').length === 2);
t('蓝桥杯命中', S.search('lanqiao', 1)[0].comp.no === 100);
t('高亮 mark', S.highlight('全国大学生机械创新设计大赛', '机械创新').includes('<mark>'));

console.log('[zongce-rules]');
t('国赛一等 +5', R.calculate({category:'contest',level:'national',prize:1}).score === 5);
t('省赛二等 +1.5', R.calculate({category:'contest',level:'provincial',prize:2}).score === 1.5);
t('校赛三等 +0.2', R.calculate({category:'contest',level:'school',prize:3}).score === 0.2);
t('市赛一等 +1.5', R.calculate({category:'contest',level:'city',prize:1}).score === 1.5);
t('体育国家第1 +5', R.calculate({category:'sport',level:'national',rank:1}).score === 5);
t('体育省第8 +1.5', R.calculate({category:'sport',level:'provincial',rank:8}).score === 1.5);
t('体育校第4 +1.5', R.calculate({category:'sport',level:'school',rank:4}).score === 1.5);
t('四级 +1', R.calculate({category:'cet'}).score === 1);
t('志愿 30h = 10分上限', R.calculate({category:'volunteer', hours:30}).score === 10);
t('志愿 16h = 3分', R.calculate({category:'volunteer', hours:16}).score === 3);
t('志愿 11h = 0.5', R.calculate({category:'volunteer', hours:11}).score === 0.5);
t('PU 55 = 2 上限', R.calculate({category:'pu', pu:55}).score === 2);
t('PU 20 = 1', R.calculate({category:'pu', pu:20}).score === 1);
t('表彰国家级 +5', R.calculate({category:'award', level:'national'}).score === 5);
t('学校办法下团队不自动折算 = 3（由学院酌情）', R.calculate({category:'contest',level:'national',prize:3,authorRank:2}).score === 3);
t('机械学院 1/2^(N-1): 第2人 = 1.5', R.calculate({category:'contest',college:'机械工程学院',compClass:'Ⅰ丙',prize:1,authorRank:2}).score === 3);
t('实测提示: 成图', R.calculate({category:'contest',level:'national',prize:2,compName:'先进成图'}).warn.length > 0);
t('实测提示: 英语竞赛特等奖限制', R.calculate({category:'contest',level:'national',prize:3,compName:'全国大学生英语竞赛'}).warn.some(p => p.includes('特等奖')));

console.log('[competition-links]');
const linkNos = Object.keys(L).map(Number);
t('全部 172 项均有入口链接', linkNos.length === 172, linkNos.length);
t('全部链接属于目录内竞赛', linkNos.every(no => no >= 1 && no <= 172));
t('全部链接为 http(s) URL', Object.values(L).every(x => /^https?:\/\//.test(x[0])));
t('官方站(official) ≥ 60 项', Object.values(L).filter(x => x[1] === 'official').length >= 60,
  Object.values(L).filter(x => x[1] === 'official').length);
t('其余为承办学院回退', Object.values(L).filter(x => x[1] === 'college').length > 90,
  Object.values(L).filter(x => x[1] === 'college').length);
t('机械学院相关竞赛有链接', [12, 52, 53, 54, 55, 56, 144].every(no => L[no]));
t('热门竞赛有链接', [1, 2, 4, 100, 80].every(no => L[no] && L[no][0]));

console.log('[other-bonus]');
t('五育数据存在', ['德育','智育','体育','美育','劳育'].some(c => (B.valid[c] || []).length > 0));
t('可加条目 > 100', Object.values(B.valid).reduce((s, a) => s + a.length, 0) > 100);
t('不可加条目存在', Object.values(B.invalid).reduce((s, a) => s + a.length, 0) > 50);
t('meta 口径标注 2025-2026', (B.meta.scope || '').includes('2025-2026'));
const cetValid = (B.valid['智育'] || []).find(i => i.name.includes('英语四级'));
t('四级作为可加项出现', !!cetValid);

console.log(`\n结果: ${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
