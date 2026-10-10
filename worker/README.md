# Cloudflare Worker — 竞赛通知每周抓取

「综测帮 · 竞赛追踪」的报名状态数据由本 Worker 每周自动抓取官方通知生成。

## 工作原理

1. **Cron Trigger** 每周一北京时间 08:00 自动运行
2. 抓取南通大学创新创业教育学院「通知公告」及各承办学院官网的通知列表
3. 过滤出含「竞赛 / 大赛 / 报名 / 选拔赛」等关键词、且不是获奖公示的通知
4. 结果（标题 + 日期 + 原文链接 + 来源学院）存入 **Cloudflare KV**，保留近 90 天
5. 每次运行轮转抓取一部分学院（免费版 CPU 时间限制），两~三周完整覆盖一轮

## 部署步骤（一次性）

```bash
cd worker
npm i -g wrangler          # 或 npx wrangler
wrangler login             # 登录你的 Cloudflare 账号
wrangler kv namespace create ZC_KV   # 创建 KV，把输出的 id 填入 wrangler.toml
wrangler deploy
```

部署后：
- Worker URL 形如 `https://ntu-zongce-fetcher.<你的子域>.workers.dev`
- `GET /api/notifications` 返回最新通知 JSON（已带 CORS，可被网站前端直接调用）
- `POST /api/trigger`（带 `X-Auth-Token` 头 = TRIGGER_SECRET）可手动触发立即抓取

## 网站前端如何消费

`tracker.html` 会尝试读取本地快照 `zongce/data/competitions-status.json`；
若要改为实时读取 Worker：

```js
fetch('https://ntu-zongce-fetcher.xxx.workers.dev/api/notifications')
  .then(r => r.json())
  .then(d => { /* d.data.items 即通知数组 */ });
```

## 免费额度说明

Cloudflare Workers 免费版每天 10 万次请求、每次 CPU 10ms——本 Worker 每周一次
定时抓取 + 前端 KV 读取，远在额度之内。
