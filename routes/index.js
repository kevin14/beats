var express = require('express');
var router = express.Router();

var mongoose = require("mongoose");
var model = require("../model");

/* GET home page. */
router.get('/', function(req, res, next) {

  //model.Posts.find({}).sort({created_at: -1}).exec(function(err, results) {
  //  if(!err && results) {
      res.render('editor', { title: 'COMPTON' /*,posts: results*/ });
  //  }
  //});

});


router.get('/feed', function(req, res, next) {

  model.Posts.find({}).sort({created_at: -1}).exec(function(err, results) {
    if(!err && results) {
      res.render('feed', { posts: results });
    }
  });

});

router.get('/shane', function(req, res, next) {

  res.send("Hey dude number 2");

});

module.exports = router;
