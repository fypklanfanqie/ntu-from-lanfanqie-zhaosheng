/**
 * 访问量计数器 - 纯前端实现
 * 使用 localStorage 记录本机访问次数
 * 使用 CountAPI 记录全局访问次数（免费无鉴权）
 */
(function() {
  'use strict';

  var STORAGE_KEY = 'ntu_campus_visitor';
  var API_NAMESPACE = 'ntu-campus-visitor-counter';
  var API_KEY = 'global-visits';

  // ========== 工具函数 ==========

  /** 获取今天的日期字符串 YYYY-MM-DD */
  function getToday() {
    var d = new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  /** 格式化大数字 1234 → 1,234 */
  function formatNumber(n) {
    if (n == null) return '...';
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // ========== 本地存储管理 ==========

  function getLocalData() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return null;
  }

  function saveLocalData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) { /* ignore */ }
  }

  function initLocalData() {
    var now = Date.now();
    var data = {
      firstVisit: now,
      lastVisit: now,
      totalVisits: 1,
      todayVisits: 1,
      todayDate: getToday()
    };
    saveLocalData(data);
    return data;
  }

  function recordVisit() {
    var data = getLocalData();
    var today = getToday();

    if (!data) {
      return initLocalData();
    }

    data.lastVisit = Date.now();
    data.totalVisits = (data.totalVisits || 0) + 1;

    if (data.todayDate === today) {
      data.todayVisits = (data.todayVisits || 0) + 1;
    } else {
      data.todayDate = today;
      data.todayVisits = 1;
    }

    saveLocalData(data);
    return data;
  }

  // ========== 全局计数 API ==========

  function fetchGlobalCount(callback) {
    var url = 'https://api.countapi.xyz/get/' + API_NAMESPACE + '/' + API_KEY;
    var done = false;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.timeout = 4000;

    xhr.onload = function() {
      if (done) return;
      done = true;
      try {
        var resp = JSON.parse(xhr.responseText);
        callback(null, resp.value || 0);
      } catch (e) {
        callback(e, null);
      }
    };

    xhr.onerror = xhr.ontimeout = function() {
      if (done) return;
      done = true;
      callback(new Error('API unavailable'), null);
    };

    xhr.send();
  }

  function hitGlobalCount(callback) {
    var url = 'https://api.countapi.xyz/hit/' + API_NAMESPACE + '/' + API_KEY;
    var done = false;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.timeout = 4000;

    xhr.onload = function() {
      if (done) return;
      done = true;
      try {
        var resp = JSON.parse(xhr.responseText);
        callback(null, resp.value || 0);
      } catch (e) {
        callback(e, null);
      }
    };

    xhr.onerror = xhr.ontimeout = function() {
      if (done) return;
      done = true;
      callback(new Error('API unavailable'), null);
    };

    xhr.send();
  }

  // ========== UI 构建 ==========

  function createCounterHTML() {
    return [
      '<div class="visitor-counter" id="visitor-counter">',
      '  <div class="vc-panel" id="vc-panel">',
      '    <div class="vc-header">',
      '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
      '        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>',
      '        <circle cx="12" cy="12" r="3"/>',
      '      </svg>',
      '      <span>访问统计</span>',
      '    </div>',
      '    <div class="vc-stats">',
      '      <div class="vc-stat-item">',
      '        <span class="vc-stat-label">总访问量</span>',
      '        <span class="vc-stat-value vc-highlight" id="vc-global">--</span>',
      '      </div>',
      '      <div class="vc-stat-item">',
      '        <span class="vc-stat-label">本机访问</span>',
      '        <span class="vc-stat-value" id="vc-local">--</span>',
      '      </div>',
      '      <div class="vc-stat-item">',
      '        <span class="vc-stat-label">今日访问</span>',
      '        <span class="vc-stat-value" id="vc-today">--</span>',
      '      </div>',
      '      <div class="vc-divider"></div>',
      '      <div class="vc-stat-item">',
      '        <span class="vc-stat-label">首次访问</span>',
      '        <span class="vc-stat-value" id="vc-first" style="font-size:0.8125rem;font-weight:500">--</span>',
      '      </div>',
      '    </div>',
      '    <div class="vc-footer">',
      '      <span class="vc-footer-text">Powered by fypklanfanqie</span>',
      '    </div>',
      '  </div>',
      '  <button class="vc-trigger" id="vc-trigger" aria-label="查看访问量">',
      '    <div class="vc-pulse"></div>',
      '    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
      '      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>',
      '      <circle cx="12" cy="12" r="3"/>',
      '    </svg>',
      '  </button>',
      '</div>'
    ].join('\n');
  }

  function formatDate(timestamp) {
    if (!timestamp) return '--';
    var d = new Date(timestamp);
    return d.getFullYear() + '/' +
      String(d.getMonth() + 1).padStart(2, '0') + '/' +
      String(d.getDate()).padStart(2, '0');
  }

  // ========== 数字动画 ==========

  function animateNumber(el, target) {
    if (target == null) {
      el.textContent = '--';
      return;
    }
    var start = 0;
    var duration = 600;
    var startTime = null;

    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      // ease-out cubic
      var eased = 1 - Math.pow(1 - progress, 3);
      var current = Math.round(start + (target - start) * eased);
      el.textContent = formatNumber(current);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  // ========== 初始化 ==========

  function init() {
    // 注入 HTML
    var container = document.createElement('div');
    container.innerHTML = createCounterHTML();
    document.body.appendChild(container.firstElementChild);

    var trigger = document.getElementById('vc-trigger');
    var panel = document.getElementById('vc-panel');
    var globalEl = document.getElementById('vc-global');
    var localEl = document.getElementById('vc-local');
    var todayEl = document.getElementById('vc-today');
    var firstEl = document.getElementById('vc-first');

    // 切换面板显示
    var panelOpen = false;
    trigger.addEventListener('click', function(e) {
      e.stopPropagation();
      panelOpen = !panelOpen;
      panel.classList.toggle('vc-show', panelOpen);
    });

    // 点击外部关闭面板
    document.addEventListener('click', function(e) {
      if (panelOpen && !panel.contains(e.target) && !trigger.contains(e.target)) {
        panelOpen = false;
        panel.classList.remove('vc-show');
      }
    });

    // 记录本次访问
    var localData = recordVisit();

    // 更新本机统计
    animateNumber(localEl, localData.totalVisits);
    animateNumber(todayEl, localData.todayVisits);
    firstEl.textContent = formatDate(localData.firstVisit);

    // 获取并更新全局统计
    globalEl.innerHTML = '<div class="vc-loading"><div class="vc-loading-dot"></div><div class="vc-loading-dot"></div><div class="vc-loading-dot"></div></div>';

    hitGlobalCount(function(err, count) {
      if (err) {
        // API 不可用时，显示本机总访问量作为替代
        globalEl.textContent = formatNumber(localData.totalVisits);
        globalEl.title = '全局计数不可用，显示本机访问量';
      } else {
        animateNumber(globalEl, count);
      }
    });
  }

  // DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
