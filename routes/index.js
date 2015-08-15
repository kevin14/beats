var express = require('express');
var router = express.Router();

var mongoose = require("mongoose");
var model = require("../model");

/* GET home page. */
router.get('/', function(req, res, next) {

  //model.Posts.find({}).sort({created_at: -1}).exec(function(err, results) {
  //  if(!err && results) {

  var results = [{
    type: "photo",
    photo: "/img/content/compton.jpg",
    title: "Compton",
    text: 'The first Dr. Dre album in sixteen years. Available now only on <a href="https://itun.es/us/GWLg9" target="_blank">Apple Music</a>'
  },{
    type: "video",
    videoId: "-F5WcFPDzko",
    photo: "/img/content/trailer.jpg",
    title: "Straight Outta Compton in theatres August 14"
  },{
    type: "video",
    videoId: "v0xd9W-7lEc",
    photo: "/img/content/dre.jpg",
    title: '<em>"We wanted to come out and make a statement."</em><br />Dr Dre and Ice Cube on what it means to be #StraightOuttaCompton'
  }];

  res.render('editor', { title: 'COMPTON',posts: results });
    //}
  //});

});


router.get('/feed', function(req, res, next) {

  model.Posts.find({}).sort({created_at: -1}).exec(function(err, results) {
    if(!err && results) {
      res.render('feed', { posts: results });
    }
  });

});


module.exports = router;
