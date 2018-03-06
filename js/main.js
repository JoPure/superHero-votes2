/**
 * Created by karl.zheng on 2016/5/23.
 */

var url = "http://10.10.18.114:7400";
//var url = "http://54.255.175.55:8680";
var actId = 100065;
var NoChoose = true;
var alreadyVote = false;
var state = false;

function init(){
    localStorage.setItem("click","");
    var state1 = localStorage.token=="";
    var state2 = localStorage.token=="undefined";
        state = state1 || state2;

    if(!state){
        var active = new Date().getTime();
        active -=1800000;
        if(active < parseInt(localStorage.loginTime)){
            /**
             * need modify here
             * */
            //$(".login p").text(localStorage.playerId).css("font-size","16px");
            $(".stateId p").text(localStorage.playerId);
            $(".stateServer p").text(localStorage.gameZone);
            $(".loginState").css("display","block");

            query();
        }else{
            state = true;
            localStorage.setItem("token","");
            $(".login").trigger("click");
        }
    }else{
        $(".login").trigger("click");
    }
}



$(function(){

    /**
     * voteArea
     * */
    $(".hoverArea").hover(function(){
        if(NoChoose){
            $(this).parent(".character").css("animation","shake .7s");
            var num = parseInt($(this).parent().parent().index())+1;
            $(this).parent(".character").css("background","url(img/character"+num+num+".png) left bottom no-repeat");
        }
    },function(){
        if(NoChoose){
            $(this).parent(".character").css("animation","none");
            var num = parseInt($(this).parent().parent().index())+1;
            $(this).parent(".character").css("background","url(img/character"+num+".png) left bottom no-repeat");
        }
    }).click(function(){
        var num = parseInt($(this).parent().parent().index())+1;

        if(!alreadyVote
        ){
            if(num==localStorage.click && NoChoose==false ){
                NoChoose = true;
                localStorage.setItem("click",num);
                $(this).parent(".character").css("background","url(img/character"+num+".png) left bottom no-repeat").find(".choose").css("display","none");
                $(".vote").css("background","url(img/voteNoChoice.png) center no-repeat").attr("disabled","disabled");
            }else{
                NoChoose = false;
                //recovery
                var state1 = localStorage.click!="";
                var state2 = localStorage.click!="undefined";
                var state3 = state1 && state2;
                if(state3){
                    var str = "character" + localStorage.click;
                    $('.'+str).parent(".character").css("background","url(img/character"+localStorage.click+".png) left bottom no-repeat").find(".choose").css("display","none");
                }

                localStorage.setItem("click",num);
                $(this).parent(".character").css("background","url(img/character"+num+num+".png) left bottom no-repeat").find(".choose").css("display","block");
                $(".vote").css("background","url(img/vote.png) center no-repeat").removeAttr("disabled");
            }
        }
    });

    /**
     * loginArea
     * */
    $(".close").click(function(){
        $(".wrap").css("display","none");
        clean();
    });

    $(".login").click(function(){
        if(state){
            $(".wrap").css("display","block");
        }else{
            alert(msg[3]);
        }
    });
    //    .hover(function(){
    //    if(!state){
    //        $(".login").css("display","none");
    //        $(".loginState").css("display","block");
    //    }
    //})


    //$(".loginState").hover(function(){
    //},function(){
    //    $(".login").css("display","block");
    //    $(".loginState").css("display","none");
    //});

    $(".logout").click(function(){
        localStorage.setItem("token","");
        state = true;
        $(".login").css("display","block");
        $(".login p").text("LOGIN").css("font-size","22px");
        $(".loginState").css("display","none");

        for(var i= 0,j=1; i<4; i++,j++ ){
            var str = ".character"+j+" p";
            $(str).text("????");
        }
        alreadyVote = false;
        NoChoose = true;
        var str = "character" + localStorage.click;
        $('.'+str).parent(".character").css("background","url(img/character"+localStorage.click+".png) left bottom no-repeat").find(".choose").css("display","none");
        $(".vote").css("background","url(img/voteNoChoice.png) center no-repeat").css("cursor","pointer").attr("disabled","disabled");
        alert(msg[5]);
    });


    $(".loginButton").click(function(){
        var username = $('#username').val();
        var password = $('#password').val();
        var gameZone = $('#gameZone').val();
        var playerId = $('#playerId').val();

        if(username=="" | password==""){
            alert(msg[1]);
        }else if(gameZone=="" | playerId==""){
            alert(msg[2]);
        }else{
            $(this).attr("disabled","disabled");
            var hash = hex_md5(password);

            $.ajax({
                type: "POST",
                url: url+"/user/login",
                data: {
                    userName: username,
                    password: hash,
                    version: 'v3'
                },
                dataType: 'jsonp',
                jsonp: "jsonCallback",

                success: function(result){
                    if(result.code==200){
                        alert(msg[4]);
                        //record
                        localStorage.setItem("username",username);
                        localStorage.setItem("password",hash);
                        localStorage.setItem("gameZone",gameZone);
                        localStorage.setItem("playerId",playerId);
                        localStorage.setItem("token",result.data.token);
                        $(".close").trigger("click");
                        state = false;
                        /**
                         * need modify here
                         * */
                        //$(".login p").text(localStorage.playerId).css("font-size","16px");
                        $(".stateId p").text(localStorage.playerId);
                        $(".stateServer p").text(localStorage.gameZone);
                        $(".loginState").css("display","block");
                        //record login time
                        var myTimer = new Date().getTime();
                        localStorage.loginTime = myTimer;

                        clean();
                        query();
                    }else{
                        alert(msg[result.code]);
                    }
                },

                complete: function(){
                    $(".loginButton").removeAttr("disabled");
                },

                error: function(err){
                    alert(err);
                }
            });
        }
    });

    $(".vote").click(function(){
        if(state){
            alert(msg[403]);

            var str = "character" + localStorage.click;
            $('.'+str).parent(".character").css("background","url(img/character"+localStorage.click+".png) left bottom no-repeat").find(".choose").css("display","none");

            $(".login").trigger("click");
        }else{
            $.ajax({
                type: "GET",
                url: url+"/act/vote/bubbled/doVote/platform",
                data: {
                    actId: actId,
                    groupIndex: 1,
                    token: localStorage.token,
                    objectId: "10"+localStorage.click,
                    playerId: localStorage.playerId,
                    gameZone: localStorage.gameZone
                },

                dataType: 'jsonp',
                jsonp: "jsonCallback",

                success: function(result){
                    if(result.code==200){
                        var data = result.data;
                        console.log(data);
                        for(var j=1; j<=4; j++){
                            var str = ".character"+j+" p";
                            var str2 = "10"+j;
                            $(str).text(data[str2]);
                        }

                        var str = "character"+localStorage.click;
                        $("."+str).parent(".character").css("background","url(img/"+str+localStorage.click+".png) left bottom no-repeat").find(".choose").css("display","block");
                        alreadyVote=true;
                        $(".vote").attr("disabled","disabled").css("cursor","not-allowed").css("background","url(img/voteAlready.png) center no-repeat");
                    }else{
                        alert(msg[result.code]);
                    }
                },

                error: function(err){
                    alert(err);
                }
            });
        }
    });


    $("#gameZone").focus(function(){
        $(".prompts").css("display","block").css("margin-top","85px");
    }).blur(function(){
        $(".prompts").css("display","none");
    });

    $("#playerId").focus(function(){
        $(".prompts").css("display","block").css("margin-top","160px");
    }).blur(function(){
        $(".prompts").css("display","none");
    });

});


function clean(){
    //clean
    $('#username').val("");
    $('#password').val("");
    $('#gameZone').val("");
    $('#playerId').val("");
}

//query history vote
function query(){
    $.ajax({
        type: "GET",
        url: url+"/act/vote/bubbled/voted",
        data: {
            actId: actId,
            token: localStorage.token
        },
        dataType: 'jsonp',
        jsonp: "jsonCallback",

        success: function(result){
            if(result.code==200){
                var data = result.data;
                if(data.length!=0){
                    var num = data[0]-100;
                    localStorage.click = num;
                    var str = ".character"+num;
                    $(str).parent(".character").css("background","url(img/character"+num+num+".png) left bottom no-repeat").find(".choose").css("display","block");
                    NoChoose = false;
                    //$("."+str).trigger("click");
                    setNum();
                    alreadyVote=true;
                    $(".vote").attr("disabled","disabled").css("cursor","not-allowed").css("background","url(img/voteAlready.png) center no-repeat");
                }
            }else{
                alert(msg[result.code]);
            }
        },

        error: function(err){
            alert(err);
        }
    });
}

//set vote nums
function setNum(){
    $.ajax({
        type: "GET",
        url: url+"/act/vote/bubbled/query",
        data: {
            actId: actId,
            sort: false,
            asc: true
        },
        dataType: 'jsonp',
        jsonp: "jsonCallback",

        success: function(result){
            if(result.code==200){
                var nums = result.data.groups[0];
                var objects = nums.objects;
                console.log(objects);
                for(var i= 0,j=1; i<4; i++,j++ ){
                    var str = ".character"+j+" p";
                    $(str).text(objects[i].count);
                }
            }else{
                alert(msg[result.code]);
            }
        }
    });
}

function reEdit(){
    var serverId = $("#gameZone").val();
    if(serverId<1){
        $("#gameZone").val(1);
    }
}

var msg = {
    "1": "Bắt buộc nhập tài khoản và mật khẩu",
    "2": "Bắt buộc nhập server hoặc ID",
    "3": "Thoát đăng nhập",
    "4": "Đăng nhập thành công",
    "5": "Thoát thành công",
    "403": "Đăng nhập trước",
    "108": "Đã bỏ phiếu",
    "301": "Tài khoản hoặc mật mã sai"
};