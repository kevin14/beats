var express = require('express');
var router = express.Router();
var aws = require('aws-sdk');
var config = require('../config');

//var http = require('http');
var gm = require("gm");
var mongoose = require("mongoose");
var model = require("../model");


router.get("/", function(req, res) {
    res.send("what");
});

router.get("/:id", function(req, res) {
    var id = req.params.id;
    model.Uploads.findOne({'file_id': id}).exec(function(err, upload) {
      if(err) {
        console.log(err);
      }

      if(upload) {
          res.render("share", {id: id, url: upload.url, baseUrl: config.baseUrl, location: upload.city});
      }
      //console.log(upload);
      //var url = upload.url;
      //console.log(url);

      //console.log(upload.url);

    });
});

router.get("/:id/wide", function(req, res) {
  model.Uploads.findOne({'file_id': req.params.id}).exec(function(err, upload) {
    if(err) {
      console.log(err);
    }
    if(upload) {
      url = upload.url.replace('https://','http://');
      res.set('Content-Type', 'image/png');
      gm(url).gravity('center').borderColor('transparent').border(527,0).stream('png').pipe(res);
    }
  });
});


module.exports = router;
