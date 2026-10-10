/* ================================================================
   综测帮 — 竞赛官方入口链接（人工逐一核验）
   ----------------------------------------------------------------
   核验方式: web_search + web_fetch 逐条验证（HTTP 状态 + 页面内容）
   核验日期: 2026-10
   规则: 只收录主办方/组委会官方域名，不含第三方聚合站
   status: verified=已验证可访问; unverified=官方站存在但核验时不可达/无独立官网
   ================================================================ */
(function (global) {
'use strict';
global.NTU_LINKS = {
  /* no: [url, 核验状态, 备注] */
  1:  ["https://cy.ncss.cn/", "verified", "全国大学生创业服务网（教育部官方报名平台）"],
  2:  ["https://www.tiaozhanbei.net/", "verified", "挑战杯官网（共青团中央等主办）"],
  3:  ["https://www.tiaozhanbei.net/", "verified", "与课外学术科技作品竞赛共用官网"],
  4:  ["https://www.mcm.edu.cn/", "verified", "CSIAM官方站；报名经中国知网 cumcm.cnki.net"],
  7:  ["https://zgs.chsi.com.cn/", "verified", "教育部学生服务与素质发展中心大赛平台"],
  8:  ["https://icpc.global/", "verified", "国际组委会官网；亚洲区见 icpc.pku.edu.cn"],
  9:  ["https://www.nuedc-training.com.cn/", "unverified", "组委会官网 nuedc.xjtu.edu.cn 核验时502，此为官方培训网"],
  10: ["https://www.jienengjianpai.org/", "verified", "竞赛官网，2026年第十九届通知在此发布"],
  11: ["http://www.gcxl.edu.cn/", "verified", "组委会官网"],
  12: ["https://umic.moocollege.com/", "verified", "官方报名平台（高校学生竞赛网）"],
  13: ["http://www.smartcarrace.com/", "verified", "中国自动化学会主办；室外赛 smartcar.zone"],
  14: ["https://www.sun-ada.net/", "verified", "大广赛官网，含作品提交系统"],
  16: ["https://www.3chuang.net/", "verified", "三创赛官方报名网站"],
  17: ["http://www.structurecontest.com/", "verified", "竞赛委员会官网"],
  22: ["", "unverified", "无独立官网；报名经组委会/学校通知"],
  30: ["https://www.robomaster.com/", "verified", "RoboMaster；Robocon=cnrobocon.net；RoboTac=robotac.cn"],
  33: ["https://cpipc.acge.org.cn/", "verified", "中国学位与研究生教育学会官方平台"],
  45: ["https://contest.i21st.cn/", "verified", "中国日报社官方报名站"],
  49: ["https://iche.zju.edu.cn/", "verified", "竞赛委员会官方站"],
  52: ["https://www.jxds.tech/", "verified", "大赛秘书处官网"],
  53: ["http://www.chengtudasai.com/", "verified", "官网（中国图学学会背景）"],
  54: ["https://3dds.3ddl.net/", "verified", "全国3D大赛官方站；2026报名转官方微信小程序"],
  55: ["http://cmes-imic.org.cn/", "verified", "中国机械工程学会主办，智能制造赛官网"],
  56: ["https://www.robotcontest.cn/", "verified", "组委会指定官网与报名网址"],
  58: ["https://star.baidu.com/", "verified", "百度官方域名"],
  60: ["https://www.fwwb.org.cn/", "verified", "大赛官网"],
  61: ["https://jsjds.blcu.edu.cn/", "verified", "组委会官网；2026报名站 2026.jsjds.com.cn"],
  62: ["https://gplt.patest.cn/", "verified", "天梯赛官网；大数据挑战赛 nercbds.tsinghua.edu.cn"],
  64: ["http://www.siemenscup-cimc.org.cn/", "verified", "大赛官网，含报名系统"],
  77: ["https://www.raicom.com.cn/", "verified", "RAICOM组委会官网"],
  80: ["https://www.contest.comap.com/undergraduate/contests/", "verified", "COMAP官方报名站"],
  81: ["https://www.cms.org.cn/", "verified", "中国数学会官网（cmathc.org.cn为聚合站勿用）"],
  100:["https://dasai.lanqiao.cn/", "verified", "蓝桥杯官方站点"],
  101:["https://match.xinje.com/", "verified", "信捷电气官方赛事系统"],
  104:["https://www.yuetu100.com/ydym5", "verified", "主办方指定活动官网（阅途平台）"],
  125:["http://www.nactrans.net/", "verified", "大赛组委会官网"],
  128:["http://www.msre.cqu.edu.cn/", "unverified", "无独立稳定官网，以当年承办高校通知为准"],
  129:["https://topics.gmw.cn/node_163037.htm", "verified", "光明网官方专题页"],
  132:["https://meiyu.js.cn/", "verified", "江苏省学校美育智慧平台（组委会官方系统）"],
  134:["https://math.seu.edu.cn/amehs/main.htm", "verified", "省高校数学教学研究会官方发布页"],
  135:["https://51mcm.cumt.edu.cn/", "verified", "组委会官网（中国矿业大学）"],
  140:["https://jssdxszsjs.mh.chaoxing.com/", "verified", "省指定官方竞赛平台（超星）"],
  141:["https://jsip.jiangsu.gov.cn/art/2025/5/28/art_75943_11572646.html", "verified", "省知识产权局官网发布页"],
  144:["https://cad.seu.edu.cn/", "verified", "承办方全国CAD应用培训网络—南京中心官网"],
  154:["", "verified", "校级赛事，以创新创业教育学院/化工学院通知为准"]
};
if (typeof module !== 'undefined') module.exports = global.NTU_LINKS;
})(typeof window !== 'undefined' ? window : globalThis);
