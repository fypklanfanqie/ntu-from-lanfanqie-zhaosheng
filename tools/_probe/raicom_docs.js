layui.config({base: 'js/'}).extend({request: 'request', search: 'search'})
layui.define(['jquery','layer','request','template','element','util','search'], function(exports){
    var $ = layui.jquery, request = layui.request, template = layui.template, search = layui.search,
      layer = parent.layer === undefined ? layui.layer : top.layer, element = layui.element, laypage = layui.laypage, util = layui.util;

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

    let field = {docType: 9, page: 1};

    function countDoc() {
        request.get("doc/count", field, function(result){
            if (result.success && result.data == 0) {
                $('#doc-page').hide();
            }
            if (result.success && result.data > 0) {
                $('#doc-page').show();
                laypage.render({
                    elem: 'doc-page',
                    count: result.data,
                    prev: '<i class="layui-icon layui-icon-left"></i>',
                    next: '<i class="layui-icon layui-icon-right"></i>',
                    theme: '#1E9FFF',
                    jump: function(obj, first) {
                        field.page = obj.curr;
                        if(!first){
                            listDoc();
                        }
                    }
                })
            }
        })
    }

    //资讯
    function listDoc() {
        request.get("doc/list", field, function(result){
            $('#docs-body').empty();
            let data = result.data;
            var str = ''
            layui.each(data, function(index, item){
                let time = util.toDateString(item.created, 'yyyy-MM-dd')
                str += '<div class="flex-box docs-item">'
                str += '<i class="iconfont icon-fangkuai-copy"></i><a href="content.html?cid='+item.id+'" class="docs-item-title">'+item.docname+'</a>'
                str += '<div class="docs-item-image">'+time+'</div>'
                str += '</div>'
            });
            $('#docs-body').html(str);
        })
    }

    countDoc();
    listDoc();

    $('.docs-tap').on('click', '.docs-tap-item', function(){
        if ($(this).hasClass('docs-tap-item-active')) return false;
        var docType = $(this).attr("lay-type");
        $('.docs-tap').find('.docs-tap-item-active').removeClass("docs-tap-item-active");
        $(this).addClass("docs-tap-item-active");
        field.docType = docType;
        field.page = 1;
        countDoc();
        listDoc();
        
    }) 


    

    
    $('#account').on('click', '#search-icon', function() {
        $('#search-form').animate({height: '70px', opacity: 1, zIndex: 100}, 300);
        $('input[name="keywords"]').focus();
    })

    $('.search-form-close').click(function() {
        $('#search-form').animate({height: '0', opacity: 0, zIndex: 0}, 300);
        $('input[name="keywords"]').val("");
        $('.search-result').html('<div class="layui-loading"><i class="layui-icon layui-icon-loading-1 layui-anim layui-anim-rotate layui-anim-loop"></i></div>')
        $('.search-result').removeClass('search-open');
    })

    $('input[name="keywords"]').on('keydown', function(e) {
        if (e.keyCode == 13) {
            $('#search-btn').trigger('click');
            return false;
        }
    })

    $('#search-btn').on('click', function() {
        let value = $('input[name="keywords"]').val();
        if ($.trim(value).length >= 2) {
            $('.search-result').addClass('search-open');
            $('.search-result').html('<div class="layui-loading"><i class="layui-icon layui-icon-loading-1 layui-anim layui-anim-rotate layui-anim-loop"></i></div>')
            request.get("listDoc", {docName: value}, function(result){
                if (result.success) {
                    let data = result.data;
                    let html = '';
                    if (!data.length) {
                        $('.search-result').html('<div class="search-item"><div class="layui-loading">未找到相关内容</div></div>')
                    } else {
                        for(let item of data) {
                            let url = '/content.html?cid='+item.id;
                            html += '<div class="search-item">';
                            html += '<a class="search-info" href="'+url+'" target="_blank">'+item.docname+'</a>';
                            html += '</div>';
                        }
                        setTimeout(function() {
                            $('.search-result').html(html);
                        }, 1000)
                    }
                }
            })
        }
    })
})
