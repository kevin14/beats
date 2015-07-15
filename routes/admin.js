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
