// 这些老站 https 有问题 → 回退 http（原始核验状态），仅保留确认 https OK 的
const fs = require('fs');
let s = fs.readFileSync('js/competition-links.js', 'utf8');
const revert = [
  ['https://www.gcxl.edu.cn/', 'http://www.gcxl.edu.cn/'],
  ['https://www.smartcarrace.com/', 'http://www.smartcarrace.com/'],
  ['https://www.chengtudasai.com/', 'http://www.chengtudasai.com/'],
  ['https://cmes-imic.org.cn/', 'http://cmes-imic.org.cn/'],
  ['https://www.nactrans.net/', 'http://www.nactrans.net/'],
  ['https://www.structurecontest.com/', 'http://www.structurecontest.com/'],
];
for (const [from, to] of revert) s = s.split(from).join(to);
fs.writeFileSync('js/competition-links.js', s);
console.log('reverted 6 hosts to http (cert invalid)');
