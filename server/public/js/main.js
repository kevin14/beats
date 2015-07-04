var uid;

$(document).ready(function(){
  drawBS(); // draw a stupid gradient

  $("#get").click(function(){
      uid = guid();
      s3_upload();
  });

});

function s3_upload() {
  var canvas = document.getElementById("myCanvas");
  var dataUrl = canvas.toDataURL("image/jpeg", 0.6);

  if (canvas.toBlob) {
    canvas.toBlob(
        function (blob) {
            var fileName = uid + ".jpg";
            getSignedRequest(blob, fileName, "image/jpeg");
        },
        'image/jpeg'
    );
  }
}

function getSignedRequest(blob, fileName, fileType){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/upload/sign_s3?s3_object_name="+fileName+"&s3_object_type="+fileType);
    xhr.onreadystatechange = function(){
        if(xhr.readyState === 4){
            if(xhr.status === 200){
                var response = JSON.parse(xhr.responseText);
                upload_file(blob, response.signed_request, response.url);
            }
            else{
                alert("Could not get signed URL.");
            }
        }
    };
    xhr.send();
}

function upload_file(blob, signed_request, url){
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", signed_request);
    xhr.setRequestHeader('x-amz-acl', 'public-read');
    xhr.onload = function() {
        if (xhr.status === 200) {
            $(".image").html(url);
        }
    };
    xhr.onerror = function() {
        alert("Could not upload file.");
    };
    xhr.send(blob);
}


function drawBS() {
  var c = document.getElementById("myCanvas");
  var ctx = c.getContext("2d");
  // Create gradient
  var grd = ctx.createLinearGradient(0,0,200,0);
  grd.addColorStop(0,"red");
  grd.addColorStop(1,"white");
  // Fill with gradient
  ctx.fillStyle = grd;
  ctx.fillRect(10,10,150,80);
}


function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}
