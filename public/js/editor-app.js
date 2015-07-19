var WW, WH; // window height / width
var currentBG = 1;

$(document).ready(function(){
  editorFunctions();
});

function editorFunctions() {

  $(".video-link").click(function(e){
    e.preventDefault();

    var videoId = $(this).data("video");
    var html = '<iframe width="560" height="315" src="https://www.youtube.com/embed/'+videoId+'?autoplay=1" frameborder="0" allowfullscreen></iframe>';
    $.featherlight(html, {});

  });

  $(document).on('keydown', function(e) {
    hideAll();
    console.log("E: " + e.which);

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
