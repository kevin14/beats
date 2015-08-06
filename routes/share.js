var express = require('express');
var router = express.Router();
var aws = require('aws-sdk');
var config = require('../config');

//var http = require('http');
var mongoose = require("mongoose");
var model = require("../model");


router.get("/", function(req, res) {
    res.send("what");
});

router.get("/:id", function(req, res) {
    var id = req.params.id;
    model.Uploads.findOne({'_id': id}).exec(function(err, upload) {
      if(err) {
        console.log(err);
      }

      if(upload) {
          res.render("share", {id: id, file_id: upload.file_id, url: upload.url, baseUrl: config.baseUrl, location: upload.city});
      } else {
        res.redirect('/');
      }
      //console.log(upload);
      //var url = upload.url;
      //console.log(url);

      //console.log(upload.url);

    });
});

router.get("/:id/wide", function(req, res) {
  var gm = require("gm"), im = gm.subClass({imageMagick: true});
  model.Uploads.findOne({'_id': req.params.id}).exec(function(err, upload) {
    if(err) {
      console.log(err);
    }
    if(upload) {
      //console.log(upload.url);
      url = upload.url.replace('https://','http://');
      res.set('Content-Type', 'image/jpeg');
      im(url).gravity('center').borderColor('#FFFFFF').resize(630).border(285,0).stream('jpeg').pipe(res);
    } else {
      res.redirect('/');
    }
  });
});


module.exports = router;
