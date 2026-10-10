const a = require('fs').readFileSync('js/main.js');
const b = require('fs').readFileSync('tools/main_live.js');
console.log('local:', a.length, 'live:', b.length, 'same:', a.equals(b));
const live = b.toString('utf8');
console.log('live has ntu-dark:', live.includes('ntu-dark'));
console.log('live dark func:', live.slice(live.indexOf('initDarkMode'), live.indexOf('initDarkMode') + 320).split('\n').slice(0, 8).join('\n'));
