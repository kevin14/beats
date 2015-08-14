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

    model.Posts.findOne({_id: req.params.id}).exec(function(err, post) {
      if(err) return

      console.log(post);

      res.render("admin_form", {title: "Edit", post: post});

    });
});

router.get("/content/add", function(req, res) {
  //list first perPage
  res.render("admin_form", {title: "Add", post: null});
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


router.post("/content/add/save", function(req, res) {
    var type = req.body.form_type;
    var photo = req.body.form_photo;

    var payload = {};

    if(type)
      payload.type = type;

    if(photo)
      payload.photo = photo;

    if(req.body.videoid)
        payload.videoId = req.body.videoid;

    //en
    if(req.body.form_title_en)
        payload.title_en = req.body.form_title_en;
    if(req.body.form_text_en)
        payload.text_en = req.body.form_text_en;

    //fr
    if(req.body.form_title_fr)
        payload.title_fr = req.body.form_title_fr;
    if(req.body.form_text_fr)
        payload.text_fr = req.body.form_text_fr;

    //de
    if(req.body.form_title_de)
        payload.title_de = req.body.form_title_de;
    if(req.body.form_text_fr)
        payload.text_de = req.body.form_text_de;

    //jp
    if(req.body.form_title_jp)
        payload.title_jp = req.body.form_title_jp;
    if(req.body.form_text_jp)
        payload.text_jp = req.body.form_text_jp;

    //ct
    if(req.body.form_title_ct)
        payload.title_ct = req.body.form_title_ct;
    if(req.body.form_text_ct)
        payload.text_ct = req.body.form_text_ct;

    //cs
    if(req.body.form_title_cs)
        payload.title_cs = req.body.form_title_cs;
    if(req.body.form_text_cs)
        payload.text_cs = req.body.form_text_cs;


    var upload = new model.Posts(payload);

    upload.save(function(){
      res.redirect("/admin/content");
    });


});


router.post("/content/edit/save", function(req, res) {
    var id = req.body.id;
    var type = req.body.form_type;
    var photo = req.body.form_photo;

    model.Posts.findById(id, function(err, result){
      if(type)
        result.type = type;

      if(photo)
        result.photo = photo;

      if(req.body.videoid)
          result.videoId = req.body.videoid;

      //en
      if(req.body.form_title_en)
          result.title_en = req.body.form_title_en;
      if(req.body.form_text_en)
          result.text_en = req.body.form_text_en;

      //fr
      if(req.body.form_title_fr)
          result.title_fr = req.body.form_title_fr;
      if(req.body.form_text_fr)
          result.text_fr = req.body.form_text_fr;

      //de
      if(req.body.form_title_de)
          result.title_de = req.body.form_title_de;
      if(req.body.form_text_fr)
          result.text_de = req.body.form_text_de;

      //jp
      if(req.body.form_title_jp)
          result.title_jp = req.body.form_title_jp;
      if(req.body.form_text_jp)
          result.text_jp = req.body.form_text_jp;

      //ct
      if(req.body.form_title_ct)
          result.title_ct = req.body.form_title_ct;
      if(req.body.form_text_ct)
          result.text_ct = req.body.form_text_ct;

      //cs
      if(req.body.form_title_cs)
          result.title_cs = req.body.form_title_cs;
      if(req.body.form_text_cs)
          result.text_cs = req.body.form_text_cs;

      result.save(function(err) {
        res.redirect("/admin/content");
      });

    });



});







module.exports = router;
