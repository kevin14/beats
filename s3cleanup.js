var config = require("./config");
var mongoose = require("mongoose");
var model = require("./model");
var CronJob = require('cron').CronJob;
var aws = require('aws-sdk');
//aws.config = new AWS.Config();

//console.log(config.awsAccess);
aws.config.update(
  {
    accessKeyId: config.awsAccess ,
    secretAccessKey: config.awsSecret
  }
);

var s3 = new aws.S3();

var numHours = 6;

mongoose.connect(config.mongoURL);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'oh no, connection error:'));
db.once('open', function callback () {
  console.log('database connected');

  startCron();



});

function startCron() {
  searchDatabase();
  var job = new CronJob('* * * * *', function() {
    console.log('Running Cron');
    searchDatabase();
  }, null, true, 'America/Los_Angeles');
  job.start();


}

function searchDatabase() {
  var rightNow = new Date();
  var cutoffTime = new Date();

  cutoffTime.setHours(rightNow.getHours() - numHours);

  model.Uploads.find({'created_at': { $lte: cutoffTime}}).exec(function(err, uploads) {
    if(err) console.log(err);

    console.log("Found " + uploads.length + " items to delete");

    for(var x = 0 ; x < uploads.length ; x++) {
      //console.log(uploads[x].file_id);
      deleteImage(uploads[x].file_id);
    }

    //deleteRecord(upload);

  });

}


function deleteImage(fileId) {
  s3.deleteObjects({
      Bucket: 'soc-assets',
      Delete: {
          Objects: [
               { Key: fileId+".jpg" }
          ]
      }
  }, function(err, data) {

      if (err)
          return console.log(err);

      console.log('Removed File '+fileId);

      model.Uploads.remove({file_id: fileId}, function(err, result){
        if(err) console.log(err);

        console.log("Removed Record " + fileId);
        console.log("");
      });

  });


}
