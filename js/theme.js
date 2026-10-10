/* ================================================================
   深色模式统一管理（全站共用）
   ----------------------------------------------------------------
   - 单一监听器：杜绝双 toggle 互相抵消
   - 存储 key: ntu-dark ("true"/"false")；兼容旧 key "theme"
   - 未手动设置过时自动跟随系统 prefers-color-scheme
   - 跨标签页同步 (storage 事件)
   ================================================================ */
(function () {
'use strict';

var KEY = 'ntu-dark';
var LEGACY_KEY = 'theme';

function stored() {
  var v = localStorage.getItem(KEY);
  if (v === 'true') return true;
  if (v === 'false') return false;
  var legacy = localStorage.getItem(LEGACY_KEY);
  if (legacy === 'dark') return true;
  if (legacy === 'light') return false;
  return null; // 未设置
}

function apply(dark) {
  document.body.classList.toggle('dark', dark);
  var btn = document.querySelector('.dark-mode-toggle');
  if (btn) btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
}

/* 初始化：尽早执行（本脚本放在 </body> 前，body 已存在） */
var initial = stored();
if (initial === null) {
  /* 跟随系统 */
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  apply(mq.matches);
  /* 系统切换时跟随（仅当用户未手动设置） */
  if (mq.addEventListener) {
    mq.addEventListener('change', function (e) {
      if (stored() === null) apply(e.matches);
    });
  }
} else {
  apply(initial);
}

/* 绑定切换按钮（只绑一次） */
function bind() {
  var btn = document.querySelector('.dark-mode-toggle');
  if (!btn || btn.dataset.themeBound) return;
  btn.dataset.themeBound = '1';
  btn.addEventListener('click', function () {
    var dark = !document.body.classList.contains('dark');
    apply(dark);
    localStorage.setItem(KEY, dark ? 'true' : 'false');
    localStorage.removeItem(LEGACY_KEY); /* 迁移旧 key */
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bind);
} else {
  bind();
}

/* 跨标签页同步 */
window.addEventListener('storage', function (e) {
  if (e.key === KEY) apply(e.newValue === 'true');
});
})();
