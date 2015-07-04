var express = require('express');
var router = express.Router();
var aws = require('aws-sdk');
var config = require('../config');

router.get("/", function(req, res) {
    res.send("hi");
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
