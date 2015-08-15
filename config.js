var config = {};
var dev = "__development__";

/*
  en = english
  fr = france
  de = germany
  jp = japan
  ct = chinese traditional
  cs = chinese simplified

*/
var language = "en";

if(dev.indexOf("development") != -1) {
  config = {
      baseUrl: "https://straightouttabeta.herokuapp.com",
      awsAccess: "AKIAJVMKHHI65RXBMX5A",
      awsSecret: "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",
      s3bucket: "soc-assets",
      s3CMSbucket: "soc-assets-cms",
      mongoURL: 'mongodb://dog:madison69@dogen.mongohq.com:10049/straightouttabeta',
      fbId: "415295758676714",
      language: language,
      port: process.env.PORT || 3001
  };
} else {
  process.env.NODE_ENV = 'production';
  config = {
      baseUrl: "http://www.straightouttasomewhere.com",
      awsAccess: "AKIAJVMKHHI65RXBMX5A",
      awsSecret: "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",
      s3bucket: "soc-assets",
      s3CMSbucket: "soc-assets-cms",
      mongoURL: 'mongodb://siteUserAdmin:6QwqxshCOMPTON6mJqWWtGxBGBw@172.32.8.43:27017/admin',
      fbId: "415295758676714",
      language: language,
      port: 8080
  };

}





module.exports = config;
