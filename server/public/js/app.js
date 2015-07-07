var WW, WH;

$(document).ready(function(){

  resizeMe();
  $(window).on("resize", resizeMe);

});


function resizeMe() {
    WW = $(window).width();
    WH = $(window).height();

    $("#top").width(WW).height(WH);
}
