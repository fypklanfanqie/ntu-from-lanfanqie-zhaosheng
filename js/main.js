/* 南通大学品牌形象网站 - 主JS（性能优化版）
   ====================================================
   优化要点：
   1. setInterval/setTimeout → requestAnimationFrame 时间驱动
   2. 高频事件（scroll）添加 rAF 节流
   3. 滚动渐显：Map 缓存索引，批量 DOM 读写
   4. 弹幕 rAF 时间驱动替代 setInterval
   5. 事件委托减少监听器数量
   6. 图片懒加载 + IntersectionObserver
   ==================================================== */
(function(){
'use strict';

/* ===== 数据（与原版完全一致） ===== */
var CAMPUS_DATA = {
  qiyuan: {
    name: '啬园校区', subtitle: '现代之心',
    desc: '南通大学主校区，坐落于崇川区啬园路，毗邻国家5A级景区濠河风景区。校园占地3000余亩，现代化建筑群与自然景观交相辉映，是通大学子求学成长的核心家园。',
    banner: 'images/qiyuan-panorama.jpg',
    buildings: [
      { name: '图书馆', img: 'images/seiyuan-library.png', desc: '图书馆坐落于校园核心区域，建筑面积4万余平方米，馆藏纸质图书300余万册，是通大学子汲取知识的殿堂。', story: '图书馆正面呈弧形展开，玻璃幕墙在阳光下熠熠生辉，夜晚灯光亮起时宛如知识的灯塔。' },
      { name: '啬园校门', img: 'images/qiyuan-gate.jpg', desc: '啬园校区南大门，通大最具标志性的地标之一。校门设计大气庄重，白色石材与现代线条相得益彰。', story: '每年开学季，无数新生在此留下与"南通大学"校名的合影，开启人生新篇章。' },
      { name: '张謇纪念园', img: 'images/qiyuan-zhangjian.jpg', desc: '纪念中国近代实业家、教育家张謇先生的园区，展现通大百年办学传承。', story: '张謇先生"父教育、母实业"的理念深深影响着一代代通大人。' },
      { name: '逸夫楼', img: 'images/qiyuan-yifu-building.jpg', desc: '由邵逸夫先生捐资兴建的教学楼，是啬园校区重要的教学场所之一。', story: '逸夫楼前的广场是校园文化活动的重要举办地，承载着无数通大人的青春记忆。' },
      { name: '莲花池', img: 'images/qiyuan-lotus.jpg', desc: '校园中心景观湖泊，夏季荷花盛开，是师生休憩赏景的好去处。', story: '每到盛夏，碧绿的荷叶间点缀着粉色莲花，成为校园最美的一道风景线。' },
      { name: '食堂', img: 'images/qiyuan-canteen-night.jpg', desc: '啬园校区拥有一食堂、二食堂和青教食堂，菜品种类丰富，价格亲民。', story: '夜晚的食堂灯火通明，温暖的灯光下是通大学子最真实的校园生活。' }
    ]
  },
  qixiu: {
    name: '启秀校区', subtitle: '文脉之源',
    desc: '启秀校区位于南通市中心濠河之畔，是南通大学最早的办学所在地。校区紧邻南通博物苑，历史文化底蕴深厚，被誉为"濠河之畔的学术明珠"。',
    banner: 'images/qixiu-panorama.jpg',
    buildings: [
      { name: '张謇故居', img: 'images/qixiu-zhangjian.jpg', desc: '校区内保存完好的张謇故居，是全国重点文物保护单位，见证百年办学历史。', story: '张謇先生在此创办了中国第一所师范学校——通州民立师范学校，开创了中国近代教育的先河。' },
      { name: '图书馆', img: 'images/qixiu-library.jpg', desc: '启秀校区图书馆，坐落于濠河之畔，环境清幽，是师生学习研究的重要场所。', story: '图书馆内古朴典雅，窗外便是濠河美景，在此阅读别有一番韵味。' },
      { name: '濠河风光', img: 'images/qixiu-haohe.jpg', desc: '校区毗邻国家5A级濠河风景区，碧水环绕，景色宜人。', story: '濠河是中国保存最完整的古护城河之一，千年的流水见证着南通的沧桑变迁。' },
      { name: '校园俯瞰', img: 'images/qixiu-overlook.jpg', desc: '从高处俯瞰启秀校区，古朴的建筑与濠河美景尽收眼底。', story: '启秀校区虽面积不大，却浓缩了南通百年教育的精华。' },
      { name: '拱桥', img: 'images/qixiu-bridge.jpg', desc: '连接校园各区域的标志性拱桥，是师生日常通行的必经之路。', story: '这座桥不仅是物理空间的连接，更象征着从历史走向未来。' },
      { name: '北区建筑', img: 'images/qixiu-north.jpg', desc: '校区北部教学区域，保留了近代建筑风格，同时融入现代化教学设施。', story: '青砖灰瓦间，传统与现代完美融合，彰显通大深厚的文化底蕴。' }
    ]
  },
  qidong: {
    name: '南通大学启东校区', subtitle: '海滨之畔',
    desc: '启东校区位于启东市高新技术产业开发区，东临黄海，西靠振海河，南北在海滨河和南海路之间。校区环境优美，是集生态式、花园式、数字式、海景式于一体的优美校园。',
    banner: 'images/qidong-banner.jpg',
    buildings: [
      { name: '教学楼', img: 'images/qidong-building.png', desc: '现代化教学楼群，配备先进的教学设施。', story: '教学楼设计融合了海滨元素，为学生提供了舒适的学习环境。' },
      { name: '图书馆', img: 'images/qidong-library.png', desc: '校区图书馆，藏书丰富，是学生学习的重要场所。', story: '图书馆临海而建，阅读之余可欣赏海景，是校区最受欢迎的地方之一。' },
      { name: '海滨广场', img: 'images/qidong-square.jpg', desc: '校区中心广场，东临黄海，是举办大型活动的场所。', story: '海滨广场是校区的地标，每年开学典礼和毕业典礼都在这里举行。' },
      { name: '学生公寓', img: 'images/qidong-dormitory.png', desc: '现代化学生公寓，设施齐全，生活便利。', story: '公寓区绿化率高，为学生提供了温馨的居住环境。' },
      { name: '食堂', img: 'images/qidong-canteen.png', desc: '校区食堂，提供丰富多样的餐饮服务。', story: '食堂的海鲜是启东校区的特色，价格实惠，深受学生喜爱。' },
      { name: '体育中心', img: 'images/qidong-gym.png', desc: '综合体育中心，设有标准运动场和室内体育馆。', story: '体育中心设施一流，是学生锻炼身体、举办体育赛事的好去处。' }
    ]
  }
};

var DANMAKU_DATA = [
  '通大图书馆真的太棒了，每次去都有满满的幸福感 📚',
  '啬园校区的宿舍条件真的不错，上床下桌有空调！',
  '一食堂的小火锅绝了，冬天必吃！强烈推荐 🍲',
  '作为通大医学生，虽然辛苦但老师们真的很负责',
  '濠河边散步太治愈了，南通这座城市很宜居 🌊',
  '社团活动超级丰富，加入了摄影社认识了好多朋友',
  '通大的学习氛围真的很好，图书馆总是满满的人',
  '新生入学的时候学长学姐特别热情，很温暖的大家庭',
  '啬园校区的莲花池夏天太美了，随手一拍就是壁纸',
  '二食堂的红烧肉是我吃过最好吃的，毕业了还想念',
  '通大的就业率真的很高，身边的同学都找到了好工作',
  '启东校区的海滨风光太美了，每天都能看到海景！',
  '考研自习室的条件很好，安静又舒适，考研上岸啦！',
  '通大的医学专业是真的强，附属医院也很厉害 💪',
  '校园绿化做得特别好，春天樱花秋天银杏美不胜收',
  '食堂阿姨人超好，每次都会多打一点菜',
  '南通大学的性价比真的很高，推荐学弟学妹报考！',
  '逸夫楼的教室设备很新，上课体验感很好',
  '加入学生会锻炼了很多能力，感谢通大给的平台',
  '学校的体育馆设施很齐全，游泳池也很干净',
  '作为外地人来南通读书，被这座城市的美食征服了',
  '通大的老师们都很平易近人，有问题随时可以问',
  '图书馆的自习区插座很多，再也不用抢充电口了',
  '参加了学校的志愿服务活动，收获满满的成长',
  '启秀校区的濠河夜景太美了，每天都想拍照',
  '通大的食堂价格真的很实惠，一个月生活费够够的',
  '毕业季最舍不得的就是通大的朋友们和校园生活',
  '学校的创新创业中心给了很多资源，感谢通大！',
  '啬园校区的地铁直达，出行特别方便 🚇',
  '通大的校训"祈通中西力求精进"一直激励着我前行'
];

/* ===== 工具函数：rAF 节流 ===== */
function rafThrottle(fn) {
  var pending = false;
  return function() {
    var ctx = this, args = arguments;
    if (pending) return;
    pending = true;
    requestAnimationFrame(function() {
      fn.apply(ctx, args);
      pending = false;
    });
  };
}

/* ===== DOM Ready ===== */
document.addEventListener('DOMContentLoaded', function() {
  initNav();
  initHeroCarousel();
  initDarkMode();
  initCampusTour();
  initDanmaku();
  initPostsToggle();
  initModal();
  initSmoothScroll();
  initCampusMap();
  initEasterEgg();
  initImageLazyLoading();
  /* 初始滚动动画（观察 DOMContentLoaded 时已存在的元素） */
  initScrollReveal();
  /* 学院巡礼是异步的，完成后需要补观察新元素 */
  initCollegeTour();
});

/* ===== 导航栏 ===== */
function initNav() {
  var nav = document.querySelector('.navbar');
  var menuBtn = document.querySelector('.mobile-menu-btn');
  var navLinks = document.querySelector('.nav-links');
  
  window.addEventListener('scroll', rafThrottle(function() {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }), { passive: true });
  
  if (menuBtn) {
    menuBtn.addEventListener('click', function() {
      menuBtn.classList.toggle('active');
      navLinks.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach(function(a) {
      a.addEventListener('click', function() {
        menuBtn.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }
}

/* ===== Hero轮播 — rAF 时间驱动替代 setInterval ===== */
function initHeroCarousel() {
  var slides = document.querySelectorAll('.hero-slide');
  if (slides.length < 2) return;
  var current = 0;
  var lastSwitch = performance.now();
  var INTERVAL = 5000;
  function tick(now) {
    if (now - lastSwitch >= INTERVAL) {
      slides[current].classList.remove('active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
      lastSwitch = now;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ===== 深色模式 ===== */
function initDarkMode() {
  var btn = document.querySelector('.dark-mode-toggle');
  if (!btn) return;
  if (localStorage.getItem('ntu-dark') === 'true') document.body.classList.add('dark');
  btn.addEventListener('click', function() {
    document.body.classList.toggle('dark');
    localStorage.setItem('ntu-dark', document.body.classList.contains('dark'));
  });
}

/* ===== 滚动动画（优化：Map 缓存索引 + 批量 DOM 操作） ===== */
function initScrollReveal() {
  document.querySelectorAll('section:not(.hero), .college-card, .bld-card, .sl-card, .guide-card, .info-card, .feature-card, .activity-card, .step-card, .campus-card, .post-card, .campus-section, .video-section, .college-detail-section').forEach(function(el) {
    if (!el.classList.contains('reveal') && !el.classList.contains('reveal-left') && !el.classList.contains('reveal-right')) {
      el.classList.add('reveal');
    }
  });

  var els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!('IntersectionObserver' in window)) {
    els.forEach(function(el) { el.classList.add('visible'); });
    return;
  }

  var indexMap = new Map();
  for (var i = 0; i < els.length; i++) indexMap.set(els[i], i);

  /* 检测是否为移动设备，调整阈值 */
  var isMobile = window.innerWidth <= 734;
  var threshold = isMobile ? 0.05 : 0.12;
  var rootMargin = isMobile ? '0px 0px -20px 0px' : '0px 0px -40px 0px';
  
  var obs = new IntersectionObserver(function(entries) {
    var batch = [];
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        batch.push({ el: e.target, delay: Math.min((indexMap.get(e.target) || 0) % 4 * 80, 240) });
        obs.unobserve(e.target);
      }
    });
    batch.forEach(function(item) {
      if (item.delay > 0) {
        setTimeout(function() { item.el.classList.add('visible'); }, item.delay);
      } else {
        requestAnimationFrame(function() { item.el.classList.add('visible'); });
      }
    });
  }, { threshold: threshold, rootMargin: rootMargin });
  els.forEach(function(el) { obs.observe(el); });

  /* 暴露全局函数：供异步生成的内容调用来补观察 reveal 元素 */
  window._observeRevealElements = function(container) {
    var newEls = container.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    newEls.forEach(function(el) {
      if (!el.classList.contains('visible') && !indexMap.has(el)) {
        indexMap.set(el, indexMap.size);
        obs.observe(el);
      }
    });
  };
}

/* ===== 校区巡礼 ===== */
function initCampusTour() {
  try {
    var container = document.getElementById('campus-tour-content');
    if (!container) return;
    var html = '';
    for (var key in CAMPUS_DATA) {
      if (!CAMPUS_DATA.hasOwnProperty(key)) continue;
      var c = CAMPUS_DATA[key];
      html += '<div class="campus-section reveal" id="campus-'+key+'"><div class="campus-banner"><img src="'+c.banner+'" alt="'+c.name+'" loading="lazy"><div class="campus-banner-overlay"><h2 class="campus-banner-title">'+c.name+' · '+c.subtitle+'</h2><p class="campus-banner-subtitle">'+c.desc+'</p></div></div><div class="buildings-grid">';
      c.buildings.forEach(function(b) {
        html += '<div class="bld-card" data-img="'+b.img+'" data-name="'+b.name+'" data-desc="'+b.desc+'" data-story="'+b.story+'"><div class="bld-img"><img src="'+b.img+'" alt="'+b.name+'" loading="lazy"></div><div class="bld-body"><h3>'+b.name+'</h3><p>'+b.desc.substring(0,60)+'...</p></div></div>';
      });
      html += '</div></div>';
    }
    container.innerHTML = html;
    /* 事件委托：减少监听器数量 */
    container.addEventListener('click', function(e) {
      var card = e.target.closest('.bld-card');
      if (card) openModal(card.dataset.img, card.dataset.name + ' — ' + card.dataset.story);
    });
    /* 补观察动态生成的 reveal 元素 */
    if (window._observeRevealElements) window._observeRevealElements(container);
  } catch(err) { console.error('initCampusTour:', err); }
}

/* ===== 弹幕效果 — rAF 时间驱动替代 setInterval/setTimeout ===== */
function initDanmaku() {
  var container = document.getElementById('danmaku-track');
  if (!container) return;
  var colors = ['#FF6B6B','#FFA07A','#FFD700','#98FB98','#87CEEB','#DDA0DD','#F0E68C','#E6E6FA','#FFB6C1','#AFEEEE','#B0E0E6','#FFE4B5','#FFC0CB','#D8BFD8','#F5DEB3','#FF69B4','#00CED1','#FF7F50','#6A5ACD','#20B2AA'];
  var sizes = [14,15,16,17,18,19,20,21,22];
  
  /* 检测是否为移动设备 */
  var isMobile = window.innerWidth <= 734;
  var maxDanmaku = isMobile ? 15 : 35;
  var spawnInterval = isMobile ? 1200 : 800;
  var initInterval = isMobile ? 600 : 400;
  var initTotal = isMobile ? 10 : DANMAKU_DATA.length;

  function createDanmaku() {
    if (container.children.length >= maxDanmaku) return;
    var el = document.createElement('div');
    el.className = 'danmaku-item';
    el.textContent = DANMAKU_DATA[Math.floor(Math.random() * DANMAKU_DATA.length)];
    var size = isMobile ? sizes[Math.floor(Math.random() * 3)] : sizes[Math.floor(Math.random() * sizes.length)];
    var color = colors[Math.floor(Math.random() * colors.length)];
    el.style.cssText = 'font-size:'+size+'px;color:'+color+';top:'+(Math.random()*85)+'%;animation-duration:'+(12+Math.random()*10)+'s;text-shadow:0 1px 3px rgba(0,0,0,.3);';
    container.appendChild(el);
    el.addEventListener('animationend', function() { el.remove(); });
  }

  /* 初始弹幕：rAF 分批创建 */
  var initCreated = 0, initLast = 0;
  function initTick(now) {
    if (initCreated < initTotal) {
      if (now - initLast >= initInterval) { createDanmaku(); initCreated++; initLast = now; }
      requestAnimationFrame(initTick);
    }
  }
  requestAnimationFrame(function(now) { initLast = now; requestAnimationFrame(initTick); });

  /* 持续补充：rAF 时间驱动 */
  var spawnLast = 0;
  function spawnTick(now) {
    if (container.children.length < maxDanmaku && now - spawnLast >= spawnInterval) {
      createDanmaku(); spawnLast = now;
    }
    requestAnimationFrame(spawnTick);
  }
  requestAnimationFrame(function(now) { spawnLast = now; requestAnimationFrame(spawnTick); });
}

/* ===== 帖子列表切换 ===== */
function initPostsToggle() {
  var btn = document.getElementById('posts-toggle-btn');
  var list = document.getElementById('posts-list');
  if (!btn || !list) return;
  btn.addEventListener('click', function() { btn.classList.toggle('active'); list.classList.toggle('show'); });
}

/* ===== 图片模态框 ===== */
function initModal() {
  var overlay = document.getElementById('modal');
  if (!overlay) return;
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay || e.target.closest('.modal-close')) { overlay.classList.remove('active'); document.body.style.overflow = ''; }
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && overlay.classList.contains('active')) { overlay.classList.remove('active'); document.body.style.overflow = ''; }
  });
}

function openModal(imgSrc, caption) {
  var overlay = document.getElementById('modal');
  if (!overlay) return;
  overlay.querySelector('.modal-content img').src = imgSrc;
  overlay.querySelector('.modal-caption').textContent = caption || '';
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

/* ===== 平滑滚动 ===== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function(a) {
    a.addEventListener('click', function(e) {
      e.preventDefault();
      var target = document.querySelector(a.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ===== 校区地图切换 ===== */
function initCampusMap() {
  try {
    var tabs = document.querySelectorAll('.map-tab');
    var iframes = document.querySelectorAll('.map-iframe');
    var infoCards = document.querySelectorAll('.map-info-card');
    if (tabs.length === 0) return;
    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        var campus = tab.dataset.campus;
        tabs.forEach(function(t) { t.classList.remove('active'); });
        tab.classList.add('active');
        iframes.forEach(function(iframe) { iframe.classList.remove('active'); if (iframe.id === 'map-iframe-'+campus) iframe.classList.add('active'); });
        infoCards.forEach(function(card) { card.classList.remove('active'); if (card.id === 'map-info-'+campus) card.classList.add('active'); });
      });
    });
  } catch(err) { console.error('initCampusMap:', err); }
}

/* ===== 学院巡礼 ===== */
function initCollegeTour() {
  var majorGrid = document.getElementById('major-grid');
  var filterContainer = document.getElementById('college-filter');
  if (!majorGrid) return;

  var dataPromise = window.COLLEGE_DATA
    ? Promise.resolve(window.COLLEGE_DATA)
    : fetch('colleges/college-data.json').then(function(r) { if (!r.ok) throw new Error('HTTP '+r.status); return r.json(); });

  dataPromise.then(function(data) {
    var allMajors = [];
    data.forEach(function(college) {
      if (college.programs) college.programs.forEach(function(p) {
        allMajors.push({ name: p, collegeId: college.id, collegeName: college.name, collegeSubtitle: college.subtitle || '' });
      });
    });
    if (filterContainer) {
      var btns = data.filter(function(c) { return c.programs && c.programs.length > 0; }).map(function(c) {
        return '<button class="college-filter-btn" data-college="'+c.id+'">'+c.name.replace(/（.*?）/g,'')+'</button>';
      }).join('');
      filterContainer.innerHTML = '<button class="college-filter-btn active" data-college="all">全部专业</button>' + btns;
      filterContainer.querySelectorAll('.college-filter-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          filterContainer.querySelectorAll('.college-filter-btn').forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
          var id = btn.dataset.college;
          renderMajorCards(id === 'all' ? allMajors : allMajors.filter(function(m) { return m.collegeId === parseInt(id); }));
        });
      });
    }
    renderMajorCards(allMajors);
  }).catch(function(err) {
    console.error('College data error:', err);
    majorGrid.innerHTML = '<p style="text-align:center;padding:2rem;color:var(--text2);">加载专业信息时出错：'+err.message+'</p>';
  });
}

function renderMajorCards(majors) {
  var grid = document.getElementById('major-grid');
  if (!grid) return;
  if (!majors.length) { grid.innerHTML = '<p style="text-align:center;padding:2rem;color:var(--text2);">该学院暂无专业信息。</p>'; return; }
  grid.innerHTML = majors.map(function(m) {
    return '<a href="colleges/major-detail.html?college='+m.collegeId+'&major='+encodeURIComponent(m.name)+'" class="major-card" data-college="'+m.collegeId+'"><div class="major-card-name">'+m.name+'</div><div class="major-card-college">'+m.collegeName.replace(/（.*?）/g,'')+'</div></a>';
  }).join('');
  /* 补观察动态生成的 reveal 元素 */
  if (window._observeRevealElements) window._observeRevealElements(grid);
}

/* ===== 彩蛋 ===== */
function initEasterEgg() {
  var heroImg = document.querySelector("body > section.hero > div.hero-content > img");
  if (!heroImg) return;
  var clickCount = 0, lastClick = 0;
  heroImg.style.cursor = 'pointer';
  heroImg.addEventListener('click', function() {
    var now = Date.now();
    if (now - lastClick > 2000) clickCount = 0;
    lastClick = now;
    if (++clickCount >= 5) { clickCount = 0; triggerEasterEgg(heroImg); }
  });
}

function triggerEasterEgg(el) {
  el.style.transition = 'transform 0.8s cubic-bezier(0.34,1.56,0.64,1)';
  el.style.transform = 'rotate(360deg) scale(1.1)';
  setTimeout(function() { el.style.transform = ''; }, 800);

  var rect = el.getBoundingClientRect();
  var cx = rect.left + rect.width/2, cy = rect.top + rect.height/2;
  var colors = ['#FF6B6B','#FFD93D','#6BCB77','#4D96FF','#FF6EC7','#A66CFF'];
  for (var i = 0; i < 30; i++) {
    var p = document.createElement('div');
    var angle = (Math.PI*2/30)*i, dist = 80+Math.random()*120, sz = 6+Math.random()*8;
    var dur = 600+Math.random()*400;
    p.style.cssText = 'position:fixed;left:'+cx+'px;top:'+cy+'px;width:'+sz+'px;height:'+sz+'px;background:'+colors[i%6]+';border-radius:50%;pointer-events:none;z-index:99999;transition:all '+dur+'ms cubic-bezier(0.25,0.46,0.45,0.94);opacity:1;';
    document.body.appendChild(p);
    (function(pp,px,py,d){requestAnimationFrame(function(){pp.style.left=px+'px';pp.style.top=py+'px';pp.style.opacity='0';pp.style.transform='scale(0)';});setTimeout(function(){pp.remove();},d+50);})(p,cx+Math.cos(angle)*dist,cy+Math.sin(angle)*dist,dur);
  }

  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);z-index:100000;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.3s;';
  var card = document.createElement('div');
  card.style.cssText = 'background:#fff;border-radius:20px;padding:2.5rem 2rem;max-width:400px;width:90%;text-align:center;box-shadow:0 25px 60px rgba(0,0,0,0.3);transform:scale(0.8) translateY(20px);transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1);';
  card.innerHTML = '<div style="font-size:3rem;margin-bottom:0.75rem;">🎉</div><h3 style="font-size:1.5rem;margin:0 0 0.5rem;color:#1d1d1f;">恭喜你发现了彩蛋！</h3><p style="color:#6e6e73;line-height:1.6;margin:0 0 1.5rem;font-size:0.95rem;">凭该页面截图，在作者介绍添加作者联系方式，我可以请你喝奶茶！</p><img src="images/easteregg-meme-new.jpg" alt="表情包" style="max-width:100%;border-radius:12px;margin-bottom:1.5rem;box-shadow:0 4px 12px rgba(0,0,0,0.1);"><button id="egg-close" style="background:linear-gradient(135deg,#0071e3,#0077ed);color:#fff;border:none;padding:10px 32px;border-radius:980px;font-size:0.95rem;font-weight:500;cursor:pointer;transition:transform 0.2s;">太棒了！</button>';
  overlay.appendChild(card);
  document.body.appendChild(overlay);
  requestAnimationFrame(function() { overlay.style.opacity='1'; card.style.transform='scale(1) translateY(0)'; });
  var close = function() { overlay.style.opacity='0'; card.style.transform='scale(0.8) translateY(20px)'; setTimeout(function(){overlay.remove();},300); };
  card.querySelector('#egg-close').addEventListener('click', close);
  overlay.addEventListener('click', function(e) { if (e.target === overlay) close(); });
  if (document.body.classList.contains('dark')) {
    card.style.background='#1c1c1e';
    card.querySelector('h3').style.color='#f5f5f7';
    card.querySelector('p').style.color='#a1a1a6';
  }
}

/* ===== 图片懒加载（非 hero 图片 + IntersectionObserver） ===== */
function initImageLazyLoading() {
  if (!('IntersectionObserver' in window)) return;
  var lazyImages = document.querySelectorAll('img[data-src]');
  if (lazyImages.length === 0) return;
  var imgObs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        var img = e.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        imgObs.unobserve(img);
      }
    });
  }, { rootMargin: '200px 0px' });
  lazyImages.forEach(function(img) { imgObs.observe(img); });
}

})();
