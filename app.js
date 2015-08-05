var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var autoprefixer = require('autoprefixer-stylus');
var stylus = require('stylus');
var connectAssets = require('connect-assets');

var auth = require('http-auth');

var rupture = require("rupture");

var mongoose = require("mongoose");

var routes = require('./routes/index');
var upload = require('./routes/upload');
var share = require('./routes/share');
var admin = require('./routes/admin');

var config = require('./config');

console.log("port is: " + config.port);

var app = express();
//var port = process.env.PORT || 3001;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


/*
if (app.get('env') === 'production') {
    app.use( require('express-force-domain')('http://www.straightouttasomewhere.com') );
}*/



// Use connect-assets asset pipeline
// @see https://github.com/adunkman/connect-assets
// NOTE This can and should replace stylus middleware
app.use(connectAssets({
  helperContext: app.locals,
  paths: ['assets/js', 'assets/css', 'public/js/bower_components'],
  fingerprinting: false
}, function(instance) {
  instance.environment.enable("autoprefixer");
}));

app.use(express.static(path.join(__dirname, 'public')));


var basic = auth.basic({
        realm: "Secret Place.",
    }, function (username, password, callback) { // Custom authentication method.
        callback(username === "north" && password === "kingdom");
    }
);

var authMiddleware = auth.connect(basic);


app.use('/', routes);
app.use('/upload', upload);
app.use('/share', share);
app.use('/admin', authMiddleware, admin);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.redirect("/");
  //var err = new Error('Not Found');
  //err.status = 404;
  //next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  //port =  3001;
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}


// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


// Livereload, will NOT run on production
require('express-livereload')(app, {
  watchDir: __dirname,
  exts: ['html', 'jade', 'styl', 'css', 'scss', 'sass', 'js', 'coffee', 'jpg', 'png', 'json']
});

mongoose.connect(config.mongoURL);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'oh no, connection error:'));
db.once('open', function callback () {
  console.log('database connected');

  if(config.port == 8080) {
    app.listen(config.port, "0.0.0.0");

  } else {
    app.listen(config.port);
  }

  console.log("listening on: http://localhost:" + config.port);


});


module.exports = app;
