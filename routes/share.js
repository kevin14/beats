var express = require('express');
var router = express.Router();
var aws = require('aws-sdk');
var config = require('../config');

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

      //TEMP
      var location = "Portland";


      if(upload) {
          res.render("share", {id: id, url: upload.url, baseUrl: config.baseUrl, location: location});
      }
      //console.log(upload);
      //var url = upload.url;
      //console.log(url);

      //console.log(upload.url);

    });
});


module.exports = router;
