layui.config({base: 'js/'}).extend({request: 'request', search: 'search'})
layui.define(['jquery','layer','request','template','element','search'], function(exports){
    var $ = layui.jquery, request = layui.request, template = layui.template,
      layer = parent.layer === undefined ? layui.layer : top.layer, element = layui.element,
      search = layui.search;

    var bannerSwiper, expertSwiper;

    $(window).scroll(function() {
        var scr=$(document).scrollTop();
        scr > 0 ? $(".nav").addClass('scroll') : $(".nav").removeClass('scroll');
    });

    $('.layui-nav-item').on("mouseenter", function() {
        $(this).find(".layui-nav-child").addClass("layui-show");
    })

    $('.layui-nav-item').on("mouseleave", function() {
        $(this).find(".layui-nav-child").removeClass("layui-show");
    })

    $('#account').on("mouseenter", '.layui-nav-item',function() {
        $(this).find(".layui-nav-child").addClass("layui-show");
    })

    $('#account').on("mouseleave", '.layui-nav-item',function() {
        $(this).find(".layui-nav-child").removeClass("layui-show");
    })

    $('.back-top').click(function() {
        $('html , body').animate({scrollTop: 0},'slow');
    })
    request.helpMenu();
    //登录状态
    request.checkLogin();

    request.get('api/matches', {}, function(result) {
        if (result.success) {
            $('#match-list-demo').tmpl(result).appendTo('#match-list');
        }
    })

    //banner
    request.get('api/getIndexBanner', {}, function(result) {
        if (result.success) {
            let obj = {};
            let data = result.data;
            obj.banner = data.filter(item => item.type == 0)[0];
            obj.studentBanner = data.filter(item => item.type == 7)[0];
            obj.teenBanner = data.filter(item => item.type == 8)[0];
            obj.matchBanner = data.filter(item => item.type == 9)[0];
            obj.citBanner = data.filter(item => item.type == 10)[0];
            obj.concatBanner = data.filter(item => item.type == 11)[0];
            $('#banner-demo').tmpl(obj).appendTo('#banner');
        }
    })

    request.get('listInstitution', {}, function(result) {
        if (result.success) {
            let obj = {};
            let data = result.data;
            obj.institution = data.filter(item => item.classify == 0);
            obj.school = data.filter(item => item.classify == 1);
            obj.company = data.filter(item => item.classify == 2);
            $('#related-demo').tmpl(obj).appendTo('#related');
        }
    })

})
