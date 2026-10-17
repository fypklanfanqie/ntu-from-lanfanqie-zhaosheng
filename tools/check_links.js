/**
 * 批量核验竞赛官方链接：HTTP 状态 + 落地页标题
 * 输出 tools/link_report.json
 */
const fs = require('fs');
const https = require('https');
const http = require('http');

const LINKS = require('../js/competition-links.js');
const comps = require('../js/competitions-data.js');
const byNo = {}; comps.forEach(c => byNo[c.no] = c);

const PROXY = { host: '127.0.0.1', port: 7897 };

function head(url, useProxy) {
  return new Promise((resolve) => {
    let u;
    try { u = new URL(url); } catch (e) { return resolve({ status: 0, err: 'bad-url' }); }
    const mod = u.protocol === 'https:' ? https : http;
    const opts = {
      method: 'GET',
      host: u.hostname,
      port: u.port || (u.protocol === 'https:' ? 443 : 80),
      path: u.pathname + u.search,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126', 'Accept': 'text/html' },
      timeout: 15000,
    };
    const req = useProxy
      ? mod.request({ ...opts, host: PROXY.host, port: PROXY.port, path: url, headers: { ...opts.headers, Host: u.hostname } })
      : mod.request(opts);
    req.on('response', (res) => {
      let body = '';
      res.on('data', (d) => { if (body.length < 8000) body += d.toString('utf8'); });
      res.on('end', () => {
        const t = (body.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '';
        resolve({ status: res.statusCode, location: res.headers.location || '', title: t.replace(/\s+/g, ' ').trim().slice(0, 50) });
      });
    });
    req.on('error', (e) => resolve({ status: 0, err: e.code || e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, err: 'timeout' }); });
    req.end();
  });
}

(async () => {
  const out = [];
  const entries = Object.entries(LINKS);
  console.log('检查', entries.length, '条链接...\n');

  for (const [no, arr] of entries) {
    const [url, status, note] = arr;
    const c = byNo[no];
    if (!url) {
      out.push({ no: +no, name: c ? c.name.slice(0, 26) : '', url: '', verdict: 'no-url', note });
      continue;
    }
    let r = await head(url, true);
    if (r.status === 301 || r.status === 302 || r.status === 307 || r.status === 308) {
      const loc = r.location;
      if (loc) { const r2 = await head(loc.startsWith('http') ? loc : new URL(loc, url).href, true); r = { ...r2, redirected: loc }; }
    }
    let verdict = 'ok';
    if (r.status === 0) verdict = 'unreachable';
    else if (r.status >= 400) verdict = 'http-' + r.status;
    else if (/404|not found|不存在|页面未找到/i.test(r.title || '')) verdict = 'soft-404';
    else if (!r.title) verdict = 'no-title';
    out.push({ no: +no, name: c ? c.name.slice(0, 26) : '', url, verdict, status: r.status, title: r.title || '', redirected: r.redirected || '', note });
    console.log(String(no).padStart(3), verdict.padEnd(12), String(r.status).padEnd(4), (r.title || '').slice(0, 34).padEnd(36), url.slice(0, 46));
  }

  fs.writeFileSync('tools/link_report.json', JSON.stringify(out, null, 1));
  const bad = out.filter(x => x.verdict !== 'ok');
  console.log('\n问题链接:', bad.length, '/', out.length);
  bad.forEach(b => console.log(' -', b.no, b.verdict, b.url, '|', b.name));
})();
