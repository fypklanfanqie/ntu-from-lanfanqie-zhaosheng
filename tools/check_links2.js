/**
 * 批量核验竞赛官方链接（curl 经代理）
 * 输出 tools/link_report.json
 */
const fs = require('fs');
const { execFileSync } = require('child_process');

const LINKS = require('../js/competition-links.js');
const comps = require('../js/competitions-data.js');
const byNo = {}; comps.forEach(c => byNo[c.no] = c);

function probe(url) {
  try {
    const out = execFileSync('curl.exe', [
      '-sSL', '-x', 'http://127.0.0.1:7897',
      '-A', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126',
      '--max-time', '25',
      '-o', 'NUL',
      '-w', '%{http_code}|%{url_effective}',
      url,
    ], { encoding: 'utf8', timeout: 40000, windowsHide: true }).trim();
    const [code, finalUrl] = out.split('|');
    return { code: parseInt(code, 10) || 0, finalUrl: finalUrl || url };
  } catch (e) {
    return { code: 0, err: String(e.message || e).slice(0, 40) };
  }
}

(async () => {
  const out = [];
  const entries = Object.entries(LINKS);
  console.log('检查', entries.length, '条链接...\n');

  for (const [no, arr] of entries) {
    const [url, status, note] = arr;
    const c = byNo[no];
    const name = c ? c.name.slice(0, 24) : '';
    if (!url) {
      out.push({ no: +no, name, url: '', verdict: 'no-url', note });
      console.log(String(no).padStart(3), 'no-url'.padEnd(11), '     ', ''.padEnd(36), '-');
      continue;
    }
    const r = probe(url);
    let verdict = 'ok';
    if (r.code === 0) verdict = 'unreachable';
    else if (r.code >= 400) verdict = 'http-' + r.code;
    out.push({ no: +no, name, url, verdict, code: r.code, finalUrl: r.finalUrl || '', note, redirected: (r.finalUrl && r.finalUrl !== url) ? r.finalUrl : '' });
    console.log(String(no).padStart(3), verdict.padEnd(11), String(r.code).padEnd(6), name.padEnd(36), url.slice(0, 44));
  }

  fs.writeFileSync('tools/link_report.json', JSON.stringify(out, null, 1));
  const bad = out.filter(x => x.verdict !== 'ok');
  console.log('\n=== 问题链接:', bad.length, '/', out.length, '===');
  bad.forEach(b => console.log(' -', String(b.no).padStart(3), b.verdict.padEnd(11), (b.name || '').padEnd(24), b.url));
  const redir = out.filter(x => x.redirected);
  console.log('\n=== 有跳转:', redir.length, '===');
  redir.forEach(r => console.log(' -', r.no, r.url.slice(0, 40), '→', (r.redirected || '').slice(0, 50)));
})();
