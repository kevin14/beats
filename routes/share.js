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
      console.log(upload.url);
      url = upload.url.replace('https://','http://');
      res.set('Content-Type', 'image/jpeg');
      im(url).gravity('center').borderColor('transparent').border(527,0).stream('jpeg').pipe(res);
    }
  });
});


module.exports = router;
