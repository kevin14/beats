var express = require('express');
var router = express.Router();

var mongoose = require("mongoose");
var model = require("../model");

var config = require("../config");

/* GET home page. */
router.get('/', function(req, res, next) {

  model.Posts.find({}).sort({created_at: -1}).exec(function(err, results) {
    if(!err && results) {

    for(var x = 0 ; x < results.length ; x++) {
      console.log(config.language);
      switch(config.language) {
        case "en":
          results[x].title = results[x].title_en;
          results[x].text = results[x].text_en;

          break;

        case "de":
          results[x].title = results[x].title_de;
          results[x].text = results[x].text_de;
          break;

        case "fr":
          results[x].title = results[x].title_fr;
          results[x].text = results[x].text_fr;
          break;

        case "jp":
          results[x].title = results[x].title_jp;
          results[x].text = results[x].text_jp;
          break;

        case "cs":
          results[x].title = results[x].title_cs;
          results[x].text = results[x].text_cs;
          break;

        case "ct":
          results[x].title = results[x].title_ct;
          results[x].text = results[x].text_ct;
          break;
      }
    }

    res.render('editor', { title: 'COMPTON',posts: results });


    }
  });

});


router.get('/feed', function(req, res, next) {

  model.Posts.find({}).sort({created_at: -1}).exec(function(err, results) {
    if(!err && results) {

      for(var x = 0 ; x < results.length ; x++) {
        console.log(config.language);
        switch(config.language) {
          case "en":
            results[x].title = results[x].title_en;
            results[x].text = results[x].text_en;

            break;

          case "de":
            results[x].title = results[x].title_de;
            results[x].text = results[x].text_de;
            break;

          case "fr":
            results[x].title = results[x].title_fr;
            results[x].text = results[x].text_fr;
            break;

          case "jp":
            results[x].title = results[x].title_jp;
            results[x].text = results[x].text_jp;
            break;

          case "cs":
            results[x].title = results[x].title_cs;
            results[x].text = results[x].text_cs;
            break;

          case "ct":
            results[x].title = results[x].title_ct;
            results[x].text = results[x].text_ct;
            break;
        }
      }

      res.render('feed', { posts: results });
    }
  });

});


router.get("/cn", function(req, res) {
    res.redirect("http://straightoutta.cn");
});

router.get("/cn/mobile", function(req, res) {
    res.send("wechat");
});




module.exports = router;
