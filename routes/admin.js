var express = require('express');
var router = express.Router();
var aws = require('aws-sdk');
var config = require('../config');

var mongoose = require("mongoose");
var model = require("../model");

var perPage = 100;

router.get("/", function(req, res) {
  //list first perPage
  res.render("admin", {title: "Compton Admin"})

});

router.get("/content", function(req, res) {
  //list first perPage

  model.Posts.count({}).exec(function(e, n) {
    model.Posts.find({}).limit(perPage).sort({created_at: -1}).exec(function(err, posts) {
      if(err) {
        console.log(err);
      }

      if(n < perPage) {
        n = 1;
      } else {
        n = Math.floor(n / perPage);
      }

      if(posts) {
          res.render("admin_content", {title: "Compton Admin", posts: posts, page: 1, count: n});
      }
    });
  });
});


router.get("/content/edit/:id", function(req, res) {
  //list first perPage

  res.send("edit");
  return;
  model.Posts.count({}).exec(function(e, n) {
    model.Posts.find({}).limit(perPage).sort({created_at: -1}).exec(function(err, posts) {
      if(err) {
        console.log(err);
      }

      if(n < perPage) {
        n = 1;
      } else {
        n = Math.floor(n / perPage);
      }

      if(posts) {
          res.render("admin_content", {title: "Compton Admin", posts: posts, page: 1, count: n});
      }
    });
  });
});

router.get("/content/add", function(req, res) {
  //list first perPage

  res.render("admin_form", {title: "Add - Compton Admin", post: null});
});



// Needs proper implementation to upload to S3 then store on Mongodb
router.get("/content/addvideo/:id", function(req, res) {
  var upload = new model.Posts({
      photo: "/img/grid/3.jpg",
      type: "video",
      title: "Exclusive Trailer",
      videoId: "z-ogfyLTkdQ",
    });

    upload.save(function(){
      res.send(id);
    });
});

// Needs proper implementation to upload to S3 then store on Mongodb
router.get("/content/addphoto/:id", function(req, res) {
  var upload = new model.Posts({
      photo: "/img/grid/9.jpg",
      type: "text",
      title: "Test123",
      text: "Lorem ipsum get down get down sit amizzle, for sure adipiscing go to hizzle. Nullam sapizzle velizzle, shizzle my nizzle crocodizzle volutpizzle, suscipit fo shizzle mah nizzle fo rizzle, mah home g-dizzle, gravida izzle, break it down"
    });

    upload.save(function(){
      res.send(id);
    });
});

router.get("/content/delete/:id", function(req, res) {
    var id = req.params.id;
    model.Posts.find({_id: id}).remove().exec(function(error) {
     res.send({sucess: true});
    });
});

router.get("/posts", function(req, res) {
  //list first perPage

  model.Uploads.count({}).exec(function(e, n) {
    model.Uploads.find({}).limit(perPage).sort({created_at: -1}).exec(function(err, posts) {
      if(err) {
        console.log(err);
      }

      if(n < perPage) {
        n = 1;
      } else {
        n = Math.floor(n / perPage);
      }

      if(posts) {
          res.render("admin_posts", {title: "Compton Posts", posts: posts, page: 1, count: n});
      }
    });
  });

});

router.get("/posts/:page", function(req, res) {
    var page = req.params.page;
    console.log(page);

    model.Uploads.count({}).exec(function(e, n) {
      model.Uploads.find({}).skip(perPage*page).sort({created_at: -1}).limit(perPage).exec(function(err, posts) {
        if(err) {
          console.log(err);
        }

        if(n < perPage) {
          n = 1;
        } else {
          n = Math.floor(n / perPage);
        }

        if(posts) {
            res.render("admin_posts", {title: "Compton Posts", posts: posts, page: page, count: n});
        }
      });
    });
});

router.get("/posts/delete/:id", function(req, res) {
    var id = req.params.id;
    model.Uploads.find({_id: id}).remove().exec(function(error) {
     res.send({sucess: true});
    });
});


module.exports = router;
