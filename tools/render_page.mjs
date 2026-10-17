// Minimal CDP page renderer: node tools/render_page.mjs <url> [waitMs]
import { spawn } from 'node:child_process';

const url = process.argv[2];
const waitMs = Number(process.argv[3] || 7000);
const CHROME = process.env.CHROME_PATH || String.raw`C:\Users\Lfq06\AppData\Local\ms-playwright\chromium_headless_shell-1248\chrome-headless-shell-win64\chrome-headless-shell.exe`;
const PORT = 9411 + Math.floor(Math.random() * 200);

const child = spawn(CHROME, [
  `--remote-debugging-port=${PORT}`,
  '--headless',
  '--disable-gpu',
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--user-data-dir=' + process.env.TEMP + '\\cdp-prof-' + Date.now(),
  'about:blank',
], { stdio: 'ignore', windowsHide: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJSON(path, method = 'GET') {
  const res = await fetch(`http://127.0.0.1:${PORT}${path}`, { method });
  return res.json();
}

async function main() {
  let ver = null;
  for (let i = 0; i < 40; i++) {
    try { ver = await getJSON('/json/version'); break; } catch { await sleep(250); }
  }
  if (!ver) throw new Error('chrome did not start');

  const target = await getJSON(`/json/new?about:blank`, 'PUT');
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

  let id = 0;
  const pending = new Map();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const myId = ++id;
    pending.set(myId, (msg) => msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result));
    ws.send(JSON.stringify({ id: myId, method, params }));
  });

  await send('Page.enable');
  await send('Runtime.enable');
  if (process.env.LOG_NET) {
    await send('Network.enable');
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.method === 'Network.requestWillBeSent') {
        const u = msg.params.request.url;
        if (u.includes('/prod-api') || u.includes('api')) console.error('[NET] ' + msg.params.request.method + ' ' + u);
      }
    });
  }
  await send('Page.navigate', { url });
  await sleep(waitMs);

  const res = await send('Runtime.evaluate', {
    expression: `(() => {
      const t = document.body ? document.body.innerText : '';
      const links = [...document.querySelectorAll('a')]
        .map(a => (a.innerText || '').replace(/\\s+/g, ' ').trim() + ' => ' + a.href)
        .filter(s => s.length > 4);
      return JSON.stringify({ title: document.title, url: location.href, text: t, links });
    })()`,
    returnByValue: true,
  });
  const payload = JSON.parse(res.result.value);
  console.log(payload.text);
  console.error('\n[URL] ' + payload.url + '\n[TITLE] ' + payload.title);
  if (process.env.EVAL) {
    const ev = await send('Runtime.evaluate', {
      expression: process.env.EVAL,
      returnByValue: true,
      awaitPromise: true,
    });
    console.error('[EVAL] ' + JSON.stringify(ev.result ? ev.result.value : ev));
  }
  if (process.env.SHOW_LINKS) {
    console.error('[LINKS]\n' + payload.links.join('\n'));
  }
  ws.close();
}

main()
  .catch((e) => { console.error('ERROR: ' + e.message); })
  .finally(async () => { await sleep(200); try { child.kill(); } catch {} process.exit(0); });
