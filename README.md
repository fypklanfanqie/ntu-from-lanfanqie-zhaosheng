<!--
  🎓 南通大学本科招生网 - Welcome to Nantong University
  一个由通大学子打造的 Apple 风格招生宣传网站
  作者：五元一斤的烂番茄 @ GitHub
-->

<p align="center">
  <img src="images/wechat-avatar.jpg" alt="NTU Logo" width="80" height="80" style="border-radius: 50%;" />
</p>

<h1 align="center">南通大学本科招生网 🎓</h1>
<h3 align="center">Welcome to Nantong University — Admissions Portal</h3>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/github/license/fypklanfanqie/welcome-to-ntu?style=flat-square" alt="License"></a>
  <a href="#"><img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white" alt="HTML5"></a>
  <a href="#"><img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white" alt="CSS3"></a>
  <a href="#"><img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript"></a>
  <a href="#"><img src="https://img.shields.io/badge/Design-Apple%20Style-999999?style=flat-square&logo=apple&logoColor=white" alt="Design"></a>
</p>

<img width="2560" height="1440" alt="屏幕截图 2026-07-11 210145" src="https://github.com/user-attachments/assets/66e2237d-e02c-4342-a05c-215ebeb10c37" />

<p align="center">
  <strong>🏫 一个由南通大学学生自主打造的现代化招生宣传网站</strong><br>
  采用 Apple 设计风格，融合液态玻璃效果，为高考考生提供沉浸式的校园浏览体验
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/School-南通大学-0071e3?style=for-the-badge" alt="NTU">
  <img src="https://img.shields.io/badge/Class-智能制造252-orange?style=for-the-badge" alt="Class">
</p>

---

## 📸 项目预览
<img width="2543" height="1313" alt="image" src="https://github.com/user-attachments/assets/28566ddd-f734-46cc-b60b-d43ddcd0becd" />


> *南通大学啬园、启秀、启东三大校区全景展示，包含校园风光、学院巡礼、住宿餐饮、入学指南、预估分数线等全方位招生信息。*

---

## ✨ 核心亮点

| 模块 | 说明 |
|------|------|
| 🏛️ **校区巡礼** | 啬园、启秀、启东三校区全景展示，含一镜到底虚拟导览 |
| 🎓 **学院巡礼** | 26个学院全覆盖，专业详情 + 学科评估，可筛选浏览 |
| 🏠 **住在通大** | 宿舍环境、食堂美食、图书馆、体育设施全面介绍 |
| 💬 **学长学姐说** | 弹幕互动 + 小红书真实评价汇总 |
| 🎬 **活力校园** | 社团/演出/竞赛/志愿活动，链接B站视频 |
| 📚 **入学指南** | 录取查询、报到流程、缴费指南、常见问题 |
| 📊 **预估分数线** | 2026年高考专业组预估线 + 预估位次，支持历史/物理类筛选 |
| 🧮 **综测帮** | 综测加分计算器（172项竞赛模糊联想）+ 竞赛追踪（文理学院推荐）+ 机械学院其他加分 |
| 👨‍💻 **作者介绍** | 个人主页、B站/Steam社交链接、照片墙 |

---

## 🧮 综测帮（南通大学学生综合测评助手）

为在校生打造的综测工具箱，入口：首页「综测帮」区块或 `zongce/index.html`。

### ✨ 加分计算器 `zongce/calculator.html`
- **模糊联想搜索**：支持汉字子串 / 全拼（`shuxuejianmo`）/ 拼音首字母（`sxjm`）/ 别名（"机创""美赛""数模"），覆盖《南通大学大学生学科竞赛目录（2026年版）》**全部 172 项**
- 输入获奖级别（国家/省/市/校）与奖次/名次/作者位次，**实时计算**可加综测分
- 依据《南通大学学生素质综合测评办法（修订）》（通大学〔2024〕33号）：智育竞赛基准表、体育名次表、四六级、志愿时长公式、表彰加分等
- 内置机械学院 2025-2026 实测口径提示（如英语竞赛仅特等奖计分）
- 支持多条记录累加清单（localStorage 本地保存）

### 🏁 竞赛追踪 `zongce/tracker.html`
- **文理分流**：选择文科生/理科生，理科生可再选 26 个学院精准推荐
- 按"承办学院匹配 → 报名状态 → 认定类别"智能排序
- **45 项重点竞赛附官方入口链接**（逐一人工核验官方域名，42 项 verified）
- 报名状态（可报名/即将开始/持续关注）由 Cloudflare Worker **每周自动抓取**创新创业教育学院及各学院官方通知更新

### 📋 其他加分（机械工程学院）`zongce/other.html`
- 五育分类（德育/智育/体育/美育/劳育）汇总机械学院综测「其他加分」条目
- 数据来自学院综测第一次审核实表：**被划掉的 = 不加分**（含避坑列表）
- ⚠️ 仅代表 2025-2026 学年机械工程学院口径

### 🔄 数据自动更新（Cloudflare Worker）
`worker/` 目录包含竞赛通知抓取 Worker：Cron 每周一自动抓取官方通知 → 存 Cloudflare KV → 前端读取报名状态。部署方法见 [worker/README.md](worker/README.md)。

### 🧪 开发与测试
```bash
python tools/build_competitions.py   # 重新生成竞赛数据（需 competition-catalog.pdf）
python tools/build_other_bonus.py    # 重新生成机械学院加分数据（需原表 xlsx）
node tools/test_integration.js       # 41 项集成测试
python tools/check_html.py           # 页面引用完整性检查
```

---



## 🎨 设计特色

### Apple 设计语言
- **色彩系统**：基于 Apple Human Interface Guidelines 色彩规范
- **字体栈**：`-apple-system, BlinkMacSystemFont, "SF Pro Display"` 系统原生字体
- **大圆角**：18-28px 设计，柔和视觉体验
- **弥散阴影**：极柔阴影增强层次感
- <img width="2532" height="1308" alt="屏幕截图 2026-07-11 210113" src="https://github.com/user-attachments/assets/60b6b53f-0cfa-4a59-b3a5-5f7b5fee91d4" />


### 🌊 液态玻璃效果（Liquid Glass）
- **毛玻璃材质**：iOS/visionOS 风格，`backdrop-filter` 实现
- **动态高光**：鼠标追踪的动态高光反射效果
- **3D 透视**：轻微 3D 透视倾斜，增强空间感
- **亮/暗模式**：自动适配系统主题
- 

### ⚡ 性能优化
- `requestAnimationFrame` 驱动动画，稳定 60fps
- `IntersectionObserver` 实现懒加载 + 滚动渐显
- 高频事件 `rAF` 节流
- 关键图片预加载策略

<img width="2545" height="1307" alt="屏幕截图 2026-07-11 210127" src="https://github.com/user-attachments/assets/8a009835-dc57-44f1-bea5-ba6135c0ae0d" />

---

## 🛠️ 技术栈

```
HTML5  ▸  语义化标签 · 无障碍访问
CSS3   ▸  CSS 变量 · Flexbox/Grid · backdrop-filter · 动画/过渡 · 媒体查询
JS     ▸  ES6+ · IntersectionObserver · requestAnimationFrame · 事件委托
```

> **零依赖纯原生开发**，无需 npm、无需构建工具，开箱即用。

---

## 📁 项目结构

```
ntu-campus/
├── index.html                    # 🏠 首页（Hero轮播 + 全部模块 + 综测帮入口）
├── author.html                   # 👨‍💻 作者介绍页
├── bilibili.html                 # 📺 B站账号展示页
├── LICENSE                       # 📄 MIT 许可证
│
├── zongce/                       # 🧮 综测帮（综合测评助手）
│   ├── index.html                #    门户（三大功能入口 + 综测小知识）
│   ├── calculator.html           #    加分计算器（模糊联想 + 规则引擎）
│   ├── tracker.html              #    竞赛追踪（文理学院推荐 + 官方链接）
│   ├── other.html                #    其他加分（机械学院五育分类）
│   └── data/                     #    报名状态快照（Worker 每周更新）
│
├── worker/                       # ☁️ Cloudflare Worker（竞赛通知每周抓取）
│   ├── src/index.js              #    Worker 主逻辑（Cron + KV + API）
│   └── wrangler.toml             #    部署配置
│
├── colleges/                     # 🎓 学院模块
│   ├── college-data.js           #    学院 & 专业数据集
│   ├── college-data.json         #    学院 JSON 数据
│   ├── college-detail.html       #    单学院详情页
│   └── major-detail.html         #    单专业详情页
│
├── details/                      # 📚 详情子页面
│   ├── admission-query.html      #    录取查询
│   ├── registration-process.html #    报到流程
│   ├── payment-guide.html        #    缴费指南
│   ├── faq.html                  #    常见问题
│   ├── campus-life.html          #    校园生活
│   ├── campus-tour.html          #    校区巡礼
│   ├── campus-virtual-tour.html  #    一镜到底虚拟导览
│   ├── guide.html                #    入学指南汇总
│   └── student-life.html         #    学生活力
│
├── css/                          # 🎨 样式表
│   ├── style.css                 #    主样式（Apple Design System）
│   ├── liquid-glass.css          #    液态玻璃效果
│   ├── zongce.css                #    综测帮样式（沿用 Apple tokens）
│   └── author.css                #    作者页专属样式
│
├── js/                           # ⚙️ JavaScript
│   ├── main.js                   #    主逻辑（导航/轮播/弹幕/懒加载）
│   ├── liquid-glass.js           #    液态玻璃交互脚本
│   ├── estimated-scores.js       #    2026 预估分数线数据
│   ├── competitions-data.js      #    172项竞赛名录（2026年版，自动生成）
│   ├── competition-links.js      #    竞赛官方入口（45项人工核验）
│   ├── zongce-rules.js           #    综测加分规则引擎
│   ├── zongce-search.js          #    竞赛模糊/拼音联想搜索
│   └── other-bonus.js            #    机械学院加分数据（划线解析）
│
├── tools/                        # 🔧 数据构建与测试脚本
│   ├── build_competitions.py     #    竞赛 PDF → 结构化数据
│   ├── build_other_bonus.py      #    综测细表 xlsx → 加分数据（识别划线）
│   ├── test_integration.js       #    41 项集成测试
│   └── check_html.py             #    页面引用完整性检查
│
├── images/                       # 🖼️ 图片资源（253 张）
│   ├── hero-*.jpg                #    Hero 轮播图（7张）
│   ├── author/                   #    作者相关图片（8张）
│   └── ...                       #    校园/建筑/食堂/宿舍等照片
│
└── assets/
    └── map-qiyuan.svg            # 🗺️ 啬园校区示意图
```

---

## 🚀 快速开始

### 1️⃣ 克隆仓库

```bash
git clone https://github.com/fypklanfanqie/welcome-to-ntu.git
cd welcome-to-ntu
```

### 2️⃣ 本地预览

**Python（推荐，最简单）：**
```bash
python -m http.server 8000
```

**Node.js：**
```bash
npx http-server -p 8000
```

**VS Code：**
安装 Live Server 插件 → 右键 `index.html` → "Open with Live Server"

### 3️⃣ 打开浏览器

访问 **http://localhost:8000** 即可预览。

---

## 🌐 部署到 GitHub Pages

本项目是纯静态网站，可以**零配置**部署到 GitHub Pages：

1. Push 代码到 GitHub 仓库
2. 进入仓库 **Settings → Pages**
3. **Source** 选择 `Deploy from a branch`
4. **Branch** 选择 `main`，目录选 `/ (root)`
5. 点击 **Save**，等待 1-2 分钟
6. 访问 `https://<你的用户名>.github.io/welcome-to-ntu/`

> 💡 也可以一键部署到 **Vercel** / **Netlify** / **Cloudflare Pages**，将仓库导入即可自动部署。

---

## 📱 响应式设计

| 设备 | 断点 | 适配策略 |
|------|------|----------|
| 📱 移动端 | < 768px | 单列布局，汉堡菜单，触摸友好 |
| 📲 平板端 | 768-1024px | 双列网格，自适应间距 |
| 🖥️ 桌面端 | > 1024px | 多列布局，完整液态玻璃效果 |

---

## 🔧 浏览器兼容性

| 浏览器 | 最低版本 | 状态 |
|--------|----------|------|
| Chrome | 80+ | ✅ 完全支持 |
| Edge | 80+ | ✅ 完全支持 |
| Safari | 13+ | ✅ 完全支持 |
| Firefox | 75+ | ✅ 完全支持 |

> 📌 对不支持 `backdrop-filter` 的浏览器会自动降级为纯色背景。

---

## 🤝 贡献指南

欢迎提 Issue 和 Pull Request！

```bash
# 1. Fork 本项目
# 2. 创建你的功能分支
git checkout -b feature/amazing-feature

# 3. 提交更改
git commit -m "✨ Add amazing feature"

# 4. 推送到分支
git push origin feature/amazing-feature

# 5. 在 GitHub 上创建 Pull Request
```

### 贡献方向
- 🆕 **内容更新**：更新学院/专业/分数数据
- 🐛 **Bug 修复**：修复兼容性或显示问题
- 🎨 **设计优化**：改进 UI/UX 体验
- ⚡ **性能提升**：优化加载速度和动画性能
- 📝 **文档完善**：改进 README 或添加注释

---

## 📄 许可证

本项目基于 **MIT License** 开源，详见 [LICENSE](LICENSE) 文件。

---

## 🙏 致谢

| 类别 | 来源 |
|------|------|
| 🎨 设计灵感 | Apple Human Interface Guidelines · iOS/visionOS |
| 📖 技术文档 | MDN Web Docs · CSS-Tricks · JavaScript.info |
| 🖼️ 图片素材 | 南通大学官方 · Unsplash · Pexels |
| ❤️ 特别感谢 | 南通大学招生办 · 开源社区 |

---

## 📞 关于作者

<p align="center">
  <img src="images/author/avatar.jpg" alt="Author Avatar" width="100" height="100" style="border-radius: 50%;" />
</p>

<p align="center">
  <strong>五元一斤的烂番茄</strong><br>
  🏫 南通大学 · 智能制造252<br><br>
  <a href="https://space.bilibili.com/478982550"><img src="https://img.shields.io/badge/Bilibili-00A1D6?style=for-the-badge&logo=bilibili&logoColor=white" alt="Bilibili"></a>
  &nbsp;
  <a href="mailto:Lfq061218@163.com"><img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email"></a>
 

<p align="center"><em>"欢迎学弟学妹来找我咨询，也可以办校园卡 嘻嘻 😊"</em></p>

---

## 🔗 相关链接

- 🏫 [南通大学官网](https://www.ntu.edu.cn)
- 📋 [南通大学招生信息网](https://zs.ntu.edu.cn)
- 📺 [B站官方账号](https://space.bilibili.com/607851602)

---

<p align="center">
  <strong>如果这个项目对你有帮助，请给个 ⭐ Star 支持一下！</strong><br>
  <sub>Made with ❤️ by Nantong University Students</sub>
</p>
