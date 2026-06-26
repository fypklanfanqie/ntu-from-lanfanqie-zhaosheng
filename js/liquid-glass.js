/* ================================================================
   南通大学本科招生网 — 液态玻璃（Liquid Glass）交互脚本
   ----------------------------------------------------------------
   功能：
   1. 鼠标追踪高光：mousemove 实时更新容器 --lg-x / --lg-y 变量
   2. 容器轻微 3D 透视倾斜（rotateX/Y ±5° 以内）
   3. requestAnimationFrame 节流，保证 60fps
   4. Intersection Observer 滚动视差模糊（idle 状态减弱模糊）
   5. 自动为目标元素注入 lg-surface / lg-card 类
   6. prefers-reduced-motion 降级：仅保留静态玻璃
   7. 触屏设备降级：移除鼠标追踪
   ================================================================ */

(function () {
  'use strict';

  /* ---------- 环境检测 ---------- */
  var supportsBackdropFilter = 'backdropFilter' in document.documentElement.style ||
    'WebkitBackdropFilter' in document.documentElement.style;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

  /* 若不支持 backdrop-filter，仅注入类名用于降级纯色背景 */
  /* 若用户开启减弱动效，不绑定鼠标追踪，仅保留静态玻璃 */

  /* ---------- 去重追踪 ---------- */
  var processedGlassElements = new Set();
  var trackedWithListeners = new Set();
  var scrollParallaxObserver = null;

  /* ================================================================
     目标元素选择器
     仅对主卡片、面板、弹窗等应用液态玻璃，保持克制
     ================================================================ */
  var LG_CARD_SELECTORS = [
    '.college-card',           /* 学院巡礼卡片 */
    '.bld-card',               /* 建筑卡片 */
    '.sl-card',                /* 活力校园卡片 */
    '.guide-card',             /* 入学指南卡片 */
    '.info-card',              /* 信息卡片 */
    '.activity-card',          /* 活动卡片 */
    '.feature-card',           /* 特色卡片 */
    '.step-card',              /* 步骤卡片 */
    '.campus-card',            /* 校区卡片 */
    '.post-card',              /* 帖子卡片 */
    '.contact-card',           /* 作者页联系方式卡片 */
    '.photo-item',             /* 作者页照片墙项 */
    '.college-detail-section', /* 学院详情区块 */
    '.detail-header',          /* 详情页头部 */
    '.map-info-card'           /* 地图信息卡片 */
  ];

  var LG_PANEL_SELECTORS = [
    '.source-section',         /* 数据来源区块 */
    '.estimated-scores > div > div:nth-child(3)', /* 预估线表格容器 */
    '.college-detail-sources'  /* 学院数据来源 */
  ];

  var LG_NAV_SELECTORS = [
    '.navbar'
  ];

  /* ================================================================
     初始化入口
     ================================================================ */
  function initLiquidGlass() {
    /* 1. 注入玻璃类名 */
    injectGlassClasses();

    /* 2. 初始化鼠标追踪（仅在支持且未减弱动效时） */
    if (supportsBackdropFilter && !prefersReducedMotion && !isTouchDevice) {
      initMouseTracking();
    }

    /* 3. 初始化滚动视差模糊 */
    if (supportsBackdropFilter && !prefersReducedMotion) {
      initScrollParallax();
    }
    
    /* 4. 初始化返回顶部按钮 */
    initBackToTop();
  }

  /* ================================================================
     注入玻璃类名到目标元素
     ================================================================ */
  function injectGlassClasses() {
    /* 卡片类 */
    LG_CARD_SELECTORS.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el) {
        if (!processedGlassElements.has(el)) {
          el.classList.add('lg-card');
          processedGlassElements.add(el);
        }
      });
    });

    /* 面板类 */
    LG_PANEL_SELECTORS.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el) {
        if (!processedGlassElements.has(el)) {
          el.classList.add('lg-panel');
          processedGlassElements.add(el);
        }
      });
    });

    /* 导航栏类 */
    LG_NAV_SELECTORS.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (el) {
        if (!processedGlassElements.has(el)) {
          el.classList.add('lg-nav');
          processedGlassElements.add(el);
        }
      });
    });

    /* 弹幕项已有玻璃样式（CSS 直接覆盖），无需加类 */
    /* 筛选按钮已有 .es-filter-btn 类（CSS 直接覆盖） */
    /* 帖子链接加 lg-surface */
    document.querySelectorAll('.post-link').forEach(function (el) {
      if (!processedGlassElements.has(el)) {
        el.classList.add('lg-surface');
        processedGlassElements.add(el);
      }
    });
  }

  /* ================================================================
     鼠标追踪高光 + 3D 倾斜
     使用 requestAnimationFrame 节流，保证 60fps
     ================================================================ */
  function initMouseTracking() {
    var trackedElements = document.querySelectorAll('.lg-card, .lg-surface');
    var pendingFrame = null;
    var activeElement = null;

    /* 为每个可追踪元素绑定事件 */
    trackedElements.forEach(function (el) {
      /* 跳过已绑定事件的元素，防止重复监听 */
      if (trackedWithListeners.has(el)) return;
      trackedWithListeners.add(el);

      /* 提示浏览器为变换层创建独立合成层，提升动画流畅度 */
      el.style.willChange = 'transform';

      el.addEventListener('mousemove', function (e) {
        var target = el;
        /* 取消未执行的帧 */
        if (pendingFrame) cancelAnimationFrame(pendingFrame);

        pendingFrame = requestAnimationFrame(function () {
          var rect = target.getBoundingClientRect();
          var x = ((e.clientX - rect.left) / rect.width) * 100;
          var y = ((e.clientY - rect.top) / rect.height) * 100;
          /* 限制范围 0-100 */
          x = Math.max(0, Math.min(100, x));
          y = Math.max(0, Math.min(100, y));
          /* 更新 CSS 变量 */
          target.style.setProperty('--lg-x', x.toFixed(2));
          target.style.setProperty('--lg-y', y.toFixed(2));
          /* 激活追踪类（启用 3D 倾斜） */
          target.classList.add('lg-tracking');
          pendingFrame = null;
        });
      });

      el.addEventListener('mouseenter', function () {
        activeElement = el;
      });

      el.addEventListener('mouseleave', function () {
        /* 离开时重置至中心，移除追踪类 */
        el.style.setProperty('--lg-x', '50');
        el.style.setProperty('--lg-y', '50');
        el.classList.remove('lg-tracking');
        if (activeElement === el) activeElement = null;
      });
    });

    /* 页面不可见时释放 will-change，降低后台 GPU 占用 */
    if ('visibilitychange' in document) {
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
          trackedElements.forEach(function (el) {
            el.style.willChange = 'auto';
          });
        } else {
          trackedElements.forEach(function (el) {
            el.style.willChange = 'transform';
          });
        }
      });
    }
  }

  /* ================================================================
     滚动视差模糊
     当玻璃块不完全在视口时（远离中心），模糊减弱（lg-idle）
     ================================================================ */
  function initScrollParallax() {
    var glassElements = document.querySelectorAll('.lg-card, .lg-surface, .lg-panel');

    if (!('IntersectionObserver' in window)) return;

    /* 断开旧 observer，防止重复创建 */
    if (scrollParallaxObserver) {
      scrollParallaxObserver.disconnect();
    }

    scrollParallaxObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var el = entry.target;
        /* intersectionRatio < 0.5 视为远离视口中心，减弱模糊 */
        if (entry.intersectionRatio < 0.5) {
          el.classList.add('lg-idle');
        } else {
          el.classList.remove('lg-idle');
        }
      });
    }, {
      threshold: [0, 0.25, 0.5, 0.75, 1]
    });

    glassElements.forEach(function (el) {
      scrollParallaxObserver.observe(el);
    });
  }

  /* ================================================================
     返回顶部按钮
     ================================================================ */
  function initBackToTop() {
    // 动态创建按钮元素
    var button = document.createElement('button');
    button.className = 'back-to-top';
    button.setAttribute('aria-label', '返回顶部');
    button.setAttribute('title', '返回顶部');
    // 使用CSS伪元素创建加号形状，无需内联HTML
    
    // 添加到body
    document.body.appendChild(button);
    
    // 滚动检测阈值（显示按钮的滚动距离）
    var SCROLL_THRESHOLD = 300;
    
    // 使用requestAnimationFrame节流滚动事件
    var ticking = false;
    
    function updateButtonVisibility() {
      var scrollY = window.scrollY || window.pageYOffset;
      
      // 滚动超过阈值时显示按钮
      if (scrollY > SCROLL_THRESHOLD) {
        button.classList.add('visible');
      } else {
        button.classList.remove('visible');
      }
      
      ticking = false;
    }
    
    // 滚动事件监听
    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(updateButtonVisibility);
        ticking = true;
      }
    }, { passive: true });
    
    // 点击事件：平滑滚动到顶部
    button.addEventListener('click', function() {
      // 使用平滑滚动
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      // 备用方案：如果浏览器不支持smooth behavior
      if (!('scrollBehavior' in document.documentElement.style)) {
        var scrollDuration = 500;
        var scrollStep = -window.scrollY / (scrollDuration / 15);
        
        var scrollInterval = setInterval(function() {
          if (window.scrollY !== 0) {
            window.scrollBy(0, scrollStep);
          } else {
            clearInterval(scrollInterval);
          }
        }, 15);
      }
    });
    
    // 键盘可访问性：支持Enter和Space键
    button.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        button.click();
      }
    });
    
    // 初始检查（页面加载时可能已经在滚动位置）
    updateButtonVisibility();
  }

  /* ================================================================
     DOM Ready
     ================================================================ */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLiquidGlass);
  } else {
    initLiquidGlass();
  }

  /* ================================================================
     动态加载内容后重新初始化
     监听 DOM 变化，对新插入的卡片注入玻璃类
     ================================================================ */
  if ('MutationObserver' in window) {
    var moTimer = null;
    var mo = new MutationObserver(function (mutations) {
      var needsReinit = false;
      for (var i = 0; i < mutations.length && !needsReinit; i++) {
        var m = mutations[i];
        for (var j = 0; j < m.addedNodes.length && !needsReinit; j++) {
          var node = m.addedNodes[j];
          if (node.nodeType === 1) {
            var hasCard = LG_CARD_SELECTORS.some(function (sel) {
              return (node.matches && node.matches(sel)) ||
                (node.querySelector && node.querySelector(sel));
            });
            if (hasCard) needsReinit = true;
          }
        }
      }
      if (needsReinit) {
        /* 防抖：合并多次 DOM 变化为一次重初始化 */
        if (moTimer) clearTimeout(moTimer);
        moTimer = setTimeout(function () {
          moTimer = null;
          injectGlassClasses();
          if (supportsBackdropFilter && !prefersReducedMotion && !isTouchDevice) {
            initMouseTracking();
          }
          if (supportsBackdropFilter && !prefersReducedMotion) {
            initScrollParallax();
          }
        }, 150);
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

})();
