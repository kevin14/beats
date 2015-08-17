var WW, WH; // window height / width
var currentBG = 1;

var intro = true;

var soundOn = true;

var currentSound = 1;
var numSounds = 6;
var mySound1,
    mySound2,
    mySound3,
    mySound4,
    mySound5,
    mySound6;

$(document).ready(function(){
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    $('html').addClass('ios');
  }

  FastClick.attach(document.body);

  editorFunctions();
  initSounds();

  resizeMe();
  $(window).on("resize", resizeMe);
});

function initSounds() {
  $("#sound-toggle").click(function(e){
    e.preventDefault();
    if($(this).hasClass("on")) {
      $(this).removeClass("on");
      $(this).html("Sound Off");
      soundOn = false;
    } else {
      $(this).addClass("on");
      $(this).html("Sound On");
      soundOn = true;
    }


  });

}

function editorFunctions() {

  $(".video-link").click(function(e){
    e.preventDefault();

    var videoId = $(this).data("video");
    ga('send', 'event', {'eventCategory': "button", 'eventAction': "videoPlay", 'eventLabel': videoId});
    var html = '<div class="video-container"><iframe width="560" height="315" src="https://www.youtube.com/embed/'+videoId+'?autoplay=1" frameborder="0" allowfullscreen></iframe></div>';
    //html = "hey";
    $.featherlight(html, {});

  });

  //$(document).on('keydown', reactToKeypress);

}

function reactToKeypress(isDeletion) {
    if(soundOn && !intro) {
      playAudio();
    }
    return;

    hideAll();
    //console.log("E: " + e.which);

    //if(e.which == 8 || e.which == 46) {
    if (isDeletion) {
        $(".type-red").css({opacity: 0}).show().css({opacity: 0.3}).fadeOut(300);

    } else {
        $(".img"+currentBG).stop().fadeIn(300, function(){
            $(this).fadeOut(2000);
        });

        currentBG++;
        if(currentBG > $( ".type-img" ).length) {
            currentBG = 1;
        }

        if(soundOn)
            playAudio();
    }


}

function playAudio() {
  return;


  switch(currentSound) {
    case 1:
      mySound6.stop();
      mySound1.play();
      break;
    case 2:
      mySound1.stop();
      mySound2.play();
      break;
    case 3:
      mySound2.stop();
      mySound3.play();
      break;
    case 4:
      mySound3.stop();
      mySound4.play();
      break;
    case 5:
      mySound4.stop();
      mySound5.play();
      break;
    case 6:
      mySound5.stop();
      mySound6.play();
      break;
  }

  currentSound++;

  if(currentSound >= numSounds) {
    currentSound = 1;
  }
}


function changeBackground() {
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

    var threshhold = 548;
    if(WH < threshhold) {
      $(".editor").height(threshhold);
      $("#top").height(threshhold);
      $("html,body").css("overflow-y", "auto");
    } else {
      $(".editor").height(WH);
      $("#top").height(WH);

    }

}

var hostname = window.location.hostname;
jQuery("#bottom a").click(function(e){
  if(jQuery(this).attr("href").indexOf(hostname)== -1){
    //alert(jQuery(this).attr("href"));
    ga('send', 'event', {'eventCategory': "Outbound Links", 'eventAction': "OnClick", 'eventLabel': jQuery(this).attr("href")});
  }
});
