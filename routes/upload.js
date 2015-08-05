var express = require('express');
var router = express.Router();
var aws = require('aws-sdk');
var config = require('../config');

var mongoose = require("mongoose");
var model = require("../model");

router.get("/", function(req, res) {
    res.send("hi");
});

router.post("/save", function(req, res) {
    // id
    // image url
    // city
    var id = req.body.id;
    var url = req.body.url;
    var city = req.body.city;

    console.log("saving " + id + " to " + city + " and " + url);

    var upload = new model.Uploads({
      file_id: id,
      url: url,
      city: city
    });

    upload.save(function(){
      res.send(upload.id);
    });

});

router.get('/sign_s3', function(req, res){
    console.log("in sign s3")
    aws.config.update({accessKeyId: config.awsAccess , secretAccessKey: config.awsSecret });

    var s3 = new aws.S3();
    var s3_params = {
        Bucket: config.s3bucket,
        Key: req.query.s3_object_name,
        Expires: 60,
        ContentType: req.query.s3_object_type,
        ACL: 'public-read'
    };

    console.log("setup s3");
    s3.getSignedUrl('putObject', s3_params, function(err, data){
        if(err){
            console.log(err);
        }
        else{
            var return_data = {
                signed_request: data,
                url: 'https://'+config.s3bucket+'.s3.amazonaws.com/'+req.query.s3_object_name
            };
            res.write(JSON.stringify(return_data));
            res.end();
        }
    });
});

module.exports = router;
