var express = require('express');
var router = express.Router();
var aws = require('aws-sdk');
var config = require('../config');

var mongoose = require("mongoose");
var model = require("../model");

var perPage = 100;

router.get("/", function(req, res) {
  //list first perPage
  model.Uploads.find({}).limit(perPage).exec(function(err, posts) {
    if(err) {
      console.log(err);
    }

    if(posts) {
        res.render("admin_posts", {posts: posts});
    }
  });
});

router.get("/:page", function(req, res) {
    var page = req.params.page;
    model.Uploads.find({}).skip(perPage*page).limit(perPage).exec(function(err, posts) {
      if(err) {
        console.log(err);
      }

      if(posts) {
          res.render("admin_posts", {posts: posts, page: page});
      }
    });
});

router.get("/delete/:id", function(req, res) {
    var id = req.params.id;
    model.Uploads.find({_id: id}).remove().exec(function(error) {
      res.send({sucess: true});
    });
});


module.exports = router;
