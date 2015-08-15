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


router.get('/sign_admin_s3', function(req, res){
    console.log("in sign admin s3")



    aws.config.update({accessKeyId: config.awsAccess , secretAccessKey: config.awsSecret });

    var s3 = new aws.S3();
    var s3_params = {
        Bucket: config.s3CMSbucket,
        Key: req.query.s3_object_name,
        Expires: 60,
        ContentType: req.query.s3_object_type,
        ACL: 'public-read'
    };

    s3.getSignedUrl('putObject', s3_params, function(err, data){
        if(err){
            console.log(err);
        }
        else{
            var return_data = {
                signed_request: data,
                url: 'https://'+config.s3CMSbucket+'.s3.amazonaws.com/'+req.query.s3_object_name
            };
            res.write(JSON.stringify(return_data));
            res.end();
        }
    });
});


module.exports = router;
