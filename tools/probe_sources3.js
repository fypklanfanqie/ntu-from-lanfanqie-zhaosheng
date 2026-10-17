/**
 * 模拟 Worker 解析各源，统计竞品通知产量
 */
const { execFileSync } = require('child_process');

const SRC = [
  ['创新创业 list1', 'https://cxcyxy.ntu.edu.cn/10412/list.htm'],
  ['创新创业 list2', 'https://cxcyxy.ntu.edu.cn/10412/list2.htm'],
  ['创新创业 list3', 'https://cxcyxy.ntu.edu.cn/10412/list3.htm'],
  ['商学院 11410', 'https://sem.ntu.edu.cn/11410/list.htm'],
  ['信科 5061', 'https://sist.ntu.edu.cn/5061/list.htm'],
  ['医学院 3651', 'https://yxy.ntu.edu.cn/3651/list.htm'],
  ['医学院 3944竞赛', 'https://yxy.ntu.edu.cn/3944/list.htm'],
  ['人工智能 9833', 'https://ai.ntu.edu.cn/9833/list.htm'],
  ['物理 tzgg', 'https://phys.ntu.edu.cn/tzgg/list.htm'],
  ['数统 jxtz', 'https://sms.ntu.edu.cn/jxtz/list.htm'],
  ['微电子 cxcy', 'https://meic.ntu.edu.cn/cxcy/list.htm'],
  ['公卫 tzgg', 'https://gw.ntu.edu.cn/tzgg/list.htm'],
  ['药学 tzgg', 'https://phar.ntu.edu.cn/tzgg/list.htm'],
  ['艺术 4685', 'https://ysxy.ntu.edu.cn/4685/list.htm'],
  ['体育 tzgg', 'https://tky.ntu.edu.cn/tzgg/list.htm'],
  ['教务处 首页', 'https://jwc.ntu.edu.cn/'],
];

const HIT = /竞赛|大赛|比赛|报名|选拔|挑战杯|锦标赛|创新创业|申报|征集|训练营/;
const EXCLUDE = /获奖|获佳绩|斩获|喜报|荣获|名单|公示|结果|评审结果|结项|立项结果|表彰|捷报|风采/;
const ART_URL = /\/(20\d{2})\/(\d{2})(\d{2})\/c\d+a\d+\/page\.htm/;

function get(url) {
  return execFileSync('curl.exe', [
    '-sSL', '-x', 'http://127.0.0.1:7897',
    '-A', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126',
    '--max-time', '25', url,
  ], { encoding: 'utf8', timeout: 40000, maxBuffer: 8 * 1024 * 1024, windowsHide: true });
}

console.log('源'.padEnd(20), '文章', '竞赛类', '最新日期', '示例');
console.log('-'.repeat(110));
let total = 0;
for (const [name, url] of SRC) {
  try {
    let html = get(url);
    const a = html.indexOf('wp_article_list');
    if (a > 0) html = html.slice(a, a + 16000);
    const re = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]{4,220}?)<\/a>/g;
    let m, arts = 0, comp = [], dates = [];
    while ((m = re.exec(html)) !== null) {
      const hit = ART_URL.exec(m[1]);
      if (!hit) continue;
      arts++;
      const title = m[2].replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
      dates.push(`${hit[1]}-${hit[2]}-${hit[3]}`);
      if (title.length < 6) continue;
      if (!HIT.test(title)) continue;
      if (EXCLUDE.test(title)) continue;
      comp.push(title);
    }
    dates.sort();
    total += comp.length;
    console.log(name.padEnd(20), String(arts).padEnd(4), String(comp.length).padEnd(5),
      (dates[dates.length - 1] || '-').padEnd(10), (comp[0] || '').slice(0, 40));
  } catch (e) {
    console.log(name.padEnd(20), 'ERR', String(e.message).slice(0, 40));
  }
}
console.log('\n合计可入库竞赛通知:', total);
