var config = require("./config");
var mongoose = require("mongoose");
var model = require("./model");

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
}

function searchDatabase() {
  var rightNow = new Date();
  var cutoffTime = new Date();

  cutoffTime.setHours(rightNow.getHours() - numHours);

  model.Uploads.find({'created_at': { $lte: cutoffTime}}).exec(function(err, uploads) {
    if(err) console.log(err);

    console.log(uploads.length);

  });

}




function deleteObject(fileName) {
  s3.deleteObjects({
      Bucket: 'soc-assets',
      Delete: {
          Objects: [
               { Key: fileName }
          ]
      }
  }, function(err, data) {

      if (err)
          return console.log(err);

      console.log('success');

  });
}
