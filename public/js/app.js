var WW, WH; // window height / width
var BV; // big video initIntro
var currentBG = 1;


$(document).ready(function(){
  resizeMe();
  $(window).on("resize", resizeMe);

  initIntro();
  //showEditor();
});

function initIntro() {
  $("#bottom").hide();
  $("#intro-video").show();
  $("#city input").prop('disabled', true);
  BV = new $.BigVideo({container: $('#intro-video')});
  BV.init();
  BV.show('/video/2chains_1.mp4',{doLoop:false});
  BV.getPlayer().volume(0);
  BV.getPlayer().on('durationchange',function(){
    $('#big-video-wrap').show();
  });

  BV.getPlayer().on("ended", function () {
    $("#intro-video").hide();
    showEditor();

  });
}

function showEditor() {
  $("#bottom").show();
  $("#editor").fadeIn();
  $("#bottom").show();
  console.log("editor");
  resizeMe();
  //$("#editor").fadeIn(1000, function(){
    //resizeMe();
    $("#city input").prop('disabled', false);
    $("#city input").focus();
  //});




  $("#city input").on('keydown', function(e) {
    hideAll();
    if(e.which == 8 || e.which == 46) {
        /*$(".type-red").stop().css({opacity: 0}).show().animate({opacity: 0.3}, function(){
          $(this).hide();
        });*/

        $(".type-red").css({opacity: 0}).show().css({opacity: 0.3}).fadeOut(300);
    } else {
        $(".img"+currentBG).stop().fadeIn(300, function(){
          $(this).fadeOut(2000);
        });

        currentBG++;
        if(currentBG > $( ".type-img" ).length) {
          currentBG = 1;
        }
    }
  });
}

function hideAll() {
  $(".type-red").hide();
  var ti = $( ".type-img" ).length;
  for(var x = 1 ; x <= ti ; x++) {
      $(".img"+x).hide();
  }
}

function resizeMe() {
    WW = $(window).width();
    WH = $(window).height();

    $("#top").width(WW).height(WH);


    $("#city").css({
        left: WW * 0.5 - $("#city").width() * 0.5,
        top: WH * 0.5 - $("#city").height() * 0.5
    });

    if(WW > 1000) {
        $("#bottom ul li").width(WW/3).height(WW/3);
    }

    if(WW < 1000 && WW > 500) {
        $("#bottom ul li").width(WW/2).height(WW/2);
    }

    if(WW <= 500) {
        $("#bottom ul li").width(WW).height(WW);
    }

}
