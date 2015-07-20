var WW, WH; // window height / width
var BV; // big video initIntro
var currentBG = 1;
var mySlide = 1;


$(document).ready(function(){
  resizeMe();
  $(window).on("resize", resizeMe);

  var images = $('img');
  $('.slide').each(function(){
    var el = $(this)
      , image = el.css('background-image').match(/url\((['"])?(.*?)\1\)/);
    if(image) {
        images = images.add($('<img>').attr('src', image.pop()));
        console.log("adding image");
    }

  });
  images.imagesLoaded(function(){
    console.log("all images loaded");
    $("#loader").hide();
    initIntro();
    resizeMe();
  });


});

var myTimer;
function enableTimer() {
  myTimer = setInterval(function(){

    if(mySlide >= 6) {
      clearInterval(myTimer);
      location.href="/editor";
    } else {
      $(".slide"+mySlide).fadeOut(300);
      mySlide++;
      var city = $(".slide"+mySlide).data("city");
      $("#city input").val(city);

    }

  }, 750)

}

function initIntro() {
  $("#city input").prop('disabled', true);

  var city = $(".slide"+mySlide).data("city");
  $("#city input").val(city);

  $("#top").fadeIn(500, function(){
    enableTimer();

  });

  return;







  /*
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

  });*/


  //introDone();

}

function introDone() {
  $("#intro-video").hide();
  //showEditor();

  location.href="/editor";
}

function resizeMe() {
    WW = $(window).width();
    WH = $(window).height();

    $("#top").width(WW).height(WH);

    $("#loader").css({
        left: WW * 0.5 - $("#loader").width() * 0.5,
        top: WH * 0.5 - $("#loader").height() * 0.5
    });

    $("#city-holder").css({
        left: WW * 0.5 - $("#city-holder").width() * 0.5,
        top: WH * 0.5 - $("#city-holder").height() * 0.5
    });

}
