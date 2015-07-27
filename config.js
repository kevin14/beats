var config = {};
var dev = "__development__";

if(dev.indexOf("development") != -1) {
  config = {
      baseUrl: "https://straightouttabeta.herokuapp.com",
      awsAccess: "AKIAIURK23YYWU5W5RNA",
      awsSecret: "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",
      s3bucket: "soc-assets",
      mongoURL: 'mongodb://dog:madison69@dogen.mongohq.com:10049/straightouttabeta',
      fbId: "415295758676714",
      port: process.env.port || 3001
  };
} else {
  config = {
      baseUrl: "http://straightouttasomewhere.com",
      awsAccess: "AKIAIURK23YYWU5W5RNA",
      awsSecret: "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",
      s3bucket: "soc-assets",
      mongoURL: 'mongodb://siteUserAdmin:6QwqxshCOMPTON6mJqWWtGxBGBw@172.32.8.43:27017/admin',
      fbId: "415295758676714",
      port: 8080
  };

}





module.exports = config;
