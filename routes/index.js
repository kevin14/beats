var express = require('express');
var router = express.Router();

var mongoose = require("mongoose");
var model = require("../model");

/* GET home page. */
router.get('/', function(req, res, next) {

  model.Posts.find({}).sort({created_at: -1}).exec(function(err, results) {
    if(!err && results) {
      res.render('index', { title: 'COMPTON', posts: results });
    }
  });

});


router.get('/editor', function(req, res, next) {
  res.render('editor', { title: 'COMPTON' });
});

router.get('/uploader', function(req, res, next) {
  res.render('uploader', { title: 'COMPTON' });
});

module.exports = router;
