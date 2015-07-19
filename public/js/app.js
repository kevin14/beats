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
  var mySlide = 1;

  var city = $(".slide"+mySlide).data("city");
  $("#city input").val(city);

  $('#slides').slick({
    dots: false,
    autoplay: true,
    arrows: false,
    draggable: false,
    infinite: true,
    speed: 300,
    autoplaySpeed: 750,
    fade: true,
    cssEase: 'linear'
  }).on('beforeChange', function(event, slick, currentSlide, nextSlide){

    mySlide++;

    var city = $(".slide"+mySlide).data("city");
    $("#city input").val(city);

    if(mySlide == $(".slide").length+1) {
      //console.log("pause");
      introDone();
      $("#city input").val("New Orleans");

      //$("#slides").slick("unslick");
      //$("#slides").slick("slickPause");
    }

  });
  //introDone();

}

function introDone() {
  $("#intro-video").hide();
  //showEditor();

  location.href="/editor";
}

function showEditor() {
  console.log("show editor");
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


  $(".video-link").click(function(e){
    e.preventDefault();

    var videoId = $(this).data("video");
    var html = '<iframe width="560" height="315" src="https://www.youtube.com/embed/'+videoId+'?autoplay=1" frameborder="0" allowfullscreen></iframe>';
    $.featherlight(html, {});


  });

}

function enableActionButtons() {
  $("#btn-download").click(function(e){
    e.preventDefault();
    alert("download image");
  });

  $("#btn-share").click(function(e){
    e.preventDefault();
    $.featherlight($(".shareWindow").html(), {});
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
        left: WW * 0.5 - $("#city-holder").width() * 0.5,
        top: WH * 0.5 - $("#city-holder").height() * 0.5
    });

}
