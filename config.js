var config = {};
// var dev = "__development__";
var dev = "production";

/*
  en = english
  fr = france
  de = germany
  jp = japan
  ct = chinese traditional
  cs = chinese simplified

*/
var language = "cs";

if(dev.indexOf("development") != -1) {
  config = {
      baseUrl: "http://localhost:3001",
      awsAccess: "__________",
      awsSecret: "__________",
      s3bucket: "soc-assets",
      s3CMSbucket: "soc-assets-cms",
      mongoURL: 'mongodb://localhost',
      fbId: "__________",
      language: language,
      port: process.env.PORT || 3001
  };
} else {
  process.env.NODE_ENV = 'production';
  config = {
      baseUrl: "http://121.40.102.208:8080",
      awsAccess: "__________",
      awsSecret: "__________",
      s3bucket: "soc-assets",
      s3CMSbucket: "soc-assets-cms",
      mongoURL: 'mongodb://localhost',
      fbId: "__________",
      language: language,
      port: 8080
  };

}

module.exports = config;
