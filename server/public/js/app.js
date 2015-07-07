var WW, WH; // window height / width
var BV; // big video initIntro

$(document).ready(function(){

  resizeMe();
  $(window).on("resize", resizeMe);

  initIntro();

});

function initIntro() {
  BV = new $.BigVideo({container: $('#intro-video')});
  BV.init();
  BV.show('http://vjs.zencdn.net/v/oceans.mp4',{doLoop:false});
  BV.getPlayer().on("ended", function () {
    showEditor();
  });
}

function showEditor() {
  console.log("editor");
}

function resizeMe() {
    WW = $(window).width();
    WH = $(window).height();

    $("#top").width(WW).height(WH);
}
