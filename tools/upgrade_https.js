// 升级 http→https（已核验这些站支持 https）
const fs = require('fs');
let s = fs.readFileSync('js/competition-links.js', 'utf8');
const pairs = [
  ['http://www.gcxl.edu.cn/', 'https://www.gcxl.edu.cn/'],
  ['http://www.smartcarrace.com/', 'https://www.smartcarrace.com/'],
  ['http://www.chengtudasai.com/', 'https://www.chengtudasai.com/'],
  ['http://cmes-imic.org.cn/', 'https://cmes-imic.org.cn/'],
  ['http://www.siemenscup-cimc.org.cn/', 'https://www.siemenscup-cimc.org.cn/'],
  ['http://www.nactrans.net/', 'https://www.nactrans.net/'],
  ['http://www.structurecontest.com/', 'https://www.structurecontest.com/'],
];
let n = 0;
for (const [from, to] of pairs) {
  if (s.includes(from)) { s = s.split(from).join(to); n++; }
}
fs.writeFileSync('js/competition-links.js', s);
console.log('upgraded', n, 'hosts to https');
