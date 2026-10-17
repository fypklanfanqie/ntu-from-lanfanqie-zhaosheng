const fs = require('fs');
const html = fs.readFileSync('zongce/calculator.html', 'utf8');
const re = /<(\/?)div\b[^>]*>/gi;
let m, depth = 0, line = 1, last = 0;
const events = [];
while ((m = re.exec(html)) !== null) {
  const before = html.slice(0, m.index);
  const ln = before.split('\n').length;
  depth += m[1] === '/' ? -1 : 1;
  events.push({ ln, depth, tag: m[0].slice(0, 40) });
}
console.log('final depth:', depth);
// 打印深度异常的位置
events.forEach((e, i) => {
  if (e.depth < 0) console.log('NEGATIVE at line', e.ln, e.tag);
});
// 打印最后的 6 个事件
events.slice(-6).forEach(e => console.log('  line', e.ln, 'depth', e.depth, e.tag));
