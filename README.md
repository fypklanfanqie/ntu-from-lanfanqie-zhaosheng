# 南通大学本科招生网

一个现代化的南通大学本科招生官方网站，采用 Apple 风格设计，提供沉浸式的校园浏览体验。

## ✨ 功能特性

### 🏠 首页展示
- **英雄轮播图**：展示校园风光的精美轮播
- **欢迎区域**：招生信息概览和快速导航
- **弹幕互动**：实时弹幕展示学长学姐寄语

### 🏛️ 校区巡礼
- **啬园校区**：主校区全景展示，包含图书馆、校门、张謇纪念园等标志性建筑
- **启秀校区**：历史校区，展示濠河风光和近代建筑
- **启东校区**：海滨校区，现代化教学设施展示

### 🎓 学院介绍
- **学院详情页**：各学院详细介绍，包含师资力量、教学成果
- **专业介绍**：专业详情和就业前景分析
- **学科评估**：学科实力展示

### 🏠 校园生活
- **宿舍环境**：各校区宿舍条件展示
- **食堂美食**：校园餐饮介绍
- **校园设施**：图书馆、运动场等设施展示

### 📚 入学指南
- **报到流程**：新生报到详细步骤
- **常见问题**：入学常见问题解答
- **缴费指南**：学费缴纳说明
- **注册流程**：学籍注册指导

### 📊 预估分数线
- **分数查询**：各专业组预估分数线
- **位次参考**：对应位次信息
- **专业组详情**：包含专业列表

### 🎬 多媒体展示
- **B站账号**：招生办官方B站账号展示
- **校园视频**：招生宣传片和校园风光视频

### 👨‍💻 作者介绍
- **个人主页**：项目作者介绍
- **社交媒体**：B站、Steam等社交链接

## 🎨 设计特色

### Apple 风格设计
- **色彩系统**：采用 Apple 官方色彩规范
- **字体栈**：系统原生字体，确保最佳显示效果
- **圆角设计**：18-28px 大圆角，柔和视觉体验
- **阴影效果**：极柔弥散阴影，增强层次感

### 液态玻璃效果（Liquid Glass）
- **毛玻璃材质**：iOS/visionOS 风格的毛玻璃效果
- **动态高光**：鼠标追踪的动态高光效果
- **3D 透视**：轻微的 3D 透视倾斜
- **响应式适配**：支持亮/暗模式自适应

### 性能优化
- **动画优化**：使用 `requestAnimationFrame` 替代 `setInterval`
- **滚动优化**：`IntersectionObserver` 实现懒加载和滚动渐显
- **事件节流**：高频事件使用 `rAF` 节流
- **图片优化**：懒加载和预加载策略

## 🛠️ 技术栈

### 前端技术
- **HTML5**：语义化标签，无障碍访问
- **CSS3**：
  - CSS 变量（Custom Properties）
  - Flexbox 和 Grid 布局
  - `backdrop-filter` 毛玻璃效果
  - CSS 动画和过渡
  - 响应式设计（媒体查询）
- **JavaScript**：
  - ES6+ 语法
  - `IntersectionObserver` API
  - `requestAnimationFrame` 动画
  - 事件委托和节流

### 设计工具
- **Apple 设计规范**：遵循 Apple Human Interface Guidelines
- **系统字体栈**：`-apple-system, BlinkMacSystemFont, "SF Pro Display"`
- **色彩变量**：统一的色彩管理系统

## 📁 项目结构

```
ntu-campus/
├── index.html                 # 首页
├── author.html                # 作者介绍页
├── bilibili.html              # B站账号页
├── colleges/                  # 学院相关页面
│   ├── college-data.js        # 学院数据
│   ├── college-data.json      # 学院JSON数据
│   ├── college-detail.html    # 学院详情页
│   └── major-detail.html      # 专业详情页
├── css/                       # 样式文件
│   ├── author.css             # 作者页样式
│   ├── liquid-glass.css       # 液态玻璃效果样式
│   └── style.css              # 主样式文件
├── details/                   # 详情页面
│   ├── admission-query.html   # 录取查询
│   ├── campus-life.html       # 校园生活
│   ├── campus-tour.html       # 校区巡礼
│   ├── campus-virtual-tour.html # 虚拟导览
│   ├── faq.html               # 常见问题
│   ├── guide.html             # 入学指南
│   ├── payment-guide.html     # 缴费指南
│   ├── registration-process.html # 注册流程
│   └── student-life.html      # 学生生活
├── images/                    # 图片资源
│   ├── author/                # 作者相关图片
│   ├── hero-*.jpg             # 轮播图图片
│   ├── ntu-*.jpg              # 校园图片
│   ├── qiyuan-*.jpg           # 啬园校区图片
│   ├── qixiu-*.jpg            # 启秀校区图片
│   └── qidong-*.jpg           # 启东校区图片
├── js/                        # JavaScript 文件
│   ├── estimated-scores.js    # 预估分数线数据
│   ├── liquid-glass.js        # 液态玻璃效果脚本
│   └── main.js                # 主脚本文件
└── assets/                    # 其他资源
    └── map-qiyuan.svg         # 校区地图
```

## 🚀 快速开始

### 本地运行

1. **克隆仓库**
   ```bash
   git clone https://gitee.com/lan-fanqie/welcome-to-ntu-from-lanfanqie.git
   cd welcome-to-ntu-from-lanfanqie
   ```

2. **启动本地服务器**
   
   **方法一：使用 Python**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```
   
   **方法二：使用 Node.js**
   ```bash
   # 安装 http-server
   npm install -g http-server
   
   # 启动服务器
   http-server -p 8000
   ```
   
   **方法三：使用 VS Code**
   - 安装 Live Server 扩展
   - 右键点击 `index.html`，选择 "Open with Live Server"

3. **访问网站**
   打开浏览器访问：`http://localhost:8000`

### 部署到 Gitee Pages

1. **推送代码到 Gitee**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **启用 Gitee Pages**
   - 访问仓库页面：`https://gitee.com/lan-fanqie/welcome-to-ntu-from-lanfanqie`
   - 点击顶部 "服务" 菜单，选择 "Gitee Pages"
   - 配置部署分支：`main`
   - 部署目录留空（根目录）
   - 点击 "启动" 按钮

3. **访问网站**
   部署成功后访问：`https://lan-fanqie.gitee.io/welcome-to-ntu-from-lanfanqie`

## 🎯 性能优化

### 动画优化
- 使用 `requestAnimationFrame` 替代 `setInterval`，确保 60fps 流畅动画
- 滚动事件使用 `rAF` 节流，避免频繁触发
- 弹幕效果使用时间驱动动画，而非定时器

### 图片优化
- 实现图片懒加载，使用 `IntersectionObserver` 监听
- 关键图片预加载，提升首屏加载速度
- 响应式图片，根据设备加载合适尺寸

### 渲染优化
- 使用 `will-change` 属性优化动画性能
- 避免强制同步布局，批量处理 DOM 操作
- 使用 `contain` 属性限制重绘范围

### 网络优化
- CSS/JS 文件压缩（生产环境）
- 图片压缩和格式优化
- 关键资源预加载

## 📱 响应式设计

### 断点设置
- **移动端**：< 768px
- **平板端**：768px - 1024px
- **桌面端**：> 1024px

### 适配策略
- 移动优先设计原则
- 灵活的网格布局
- 自适应图片和媒体
- 触摸友好的交互设计

## 🔧 浏览器支持

### 现代浏览器
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### 特性支持
- `backdrop-filter`：毛玻璃效果
- `IntersectionObserver`：懒加载和滚动渐显
- `requestAnimationFrame`：流畅动画
- CSS 变量：主题切换

### 降级方案
- 不支持 `backdrop-filter` 的浏览器显示纯色背景
- 不支持 `IntersectionObserver` 的浏览器使用滚动事件监听
- 减弱动效模式：尊重用户系统设置

## 🤝 贡献指南

### 如何贡献

1. **Fork 项目**
   点击仓库右上角的 "Fork" 按钮

2. **创建分支**
   ```bash
   git checkout -b feature/your-feature
   ```

3. **提交更改**
   ```bash
   git add .
   git commit -m "Add your feature"
   git push origin feature/your-feature
   ```

4. **创建 Pull Request**
   在 Gitee 上创建 Pull Request，描述你的更改

### 贡献类型

- **功能增强**：添加新功能或改进现有功能
- **Bug 修复**：修复已知问题
- **文档完善**：改进文档或添加示例
- **性能优化**：提升网站性能
- **设计改进**：优化用户界面和用户体验

### 代码规范

- **HTML**：使用语义化标签，添加无障碍属性
- **CSS**：遵循 BEM 命名规范，使用 CSS 变量
- **JavaScript**：使用 ES6+ 语法，添加注释
- **图片**：优化图片大小，添加 alt 属性

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE)。

## 🙏 致谢

### 设计灵感
- **Apple 设计规范**：Human Interface Guidelines
- **iOS/visionOS**：液态玻璃效果灵感来源

### 技术参考
- **MDN Web Docs**：Web 技术文档
- **CSS-Tricks**：CSS 技巧和最佳实践
- **JavaScript.info**：JavaScript 现代教程

### 图片资源
- **南通大学官方**：校园风光图片
- **Unsplash**：部分免费图片资源
- **Pexels**：高质量免费图片

### 特别感谢
- **南通大学招生办**：提供招生信息和数据支持
- **五元一斤的烂番茄**：项目作者和主要开发者
- **开源社区**：提供技术支持和灵感

## 📞 联系方式

- **作者**：五元一斤的烂番茄
- **B站**：https://space.bilibili.com/478982550?spm_id_from=333.1391.0.0
- **邮箱**：Lfq061218@163.com

## 🔗 相关链接

- **项目地址**：[https://gitee.com/lan-fanqie/welcome-to-ntu-from-lanfanqie](https://gitee.com/lan-fanqie/welcome-to-ntu-from-lanfanqie)
- **在线预览**：[https://lan-fanqie.gitee.io/welcome-to-ntu-from-lanfanqie](https://lan-fanqie.gitee.io/welcome-to-ntu-from-lanfanqie)
- **南通大学官网**：[https://www.ntu.edu.cn](https://www.ntu.edu.cn)

---

**欢迎 Star ⭐ 和 Fork 🍴 支持本项目！**