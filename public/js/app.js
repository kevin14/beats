var WW, WH; // window height / width
var BV; // big video initIntro
var currentBG = 1;


$(document).ready(function(){
  resizeMe();
  $(window).on("resize", resizeMe);



  //initIntro();
  showEditor();

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
  $("#beats-logo").fadeIn(500);
  $("#bottom").show();
  $("#editor").fadeIn();
  $("#bottom").show();

  $("#beats-logo-white").hide();


  resizeMe();
  $("#city input").prop('disabled', false);
  $("#city input").focus();
  $("#city input").inputfit();



  $("#buttons a img").hover(function(){
    $(this).attr('src', $(this).attr('src').replace(/\.png/, '-over.png') );
  }, function(){
    $(this).attr('src', $(this).attr('src').replace(/\-over.png/, '.png') );
  });


  enableActionButtons();


  $("#city input").on('keydown', function(e) {
    hideAll();

    if(e.which == 8 || e.which == 46) {
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

  $("#city input").on('keyup', function(e) {
    var myInput = $(this);

    if(myInput.val().length > 0) {
      $("#buttons").show();
    } else {
      $("#buttons").hide();
    }
  });

}

function enableActionButtons() {
  $("#btn-download").click(function(e){
    e.preventDefault();
    alert("download image");
  });

  $("#btn-share").click(function(e){
    e.preventDefault();
    $.featherlight($(".share").html(), {});
  });

  $("#btn-addphoto").click(function(e){
    e.preventDefault();
    alert("add photo");
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


    $("#city-holder").css({
        left: WW * 0.5 - $("#city").width() * 0.5,
        top: WH * 0.5 - $("#city").height() * 0.5
    });

}
