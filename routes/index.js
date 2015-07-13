var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'COMPTON' });
});


router.get('/editor', function(req, res, next) {
  res.render('editor', { title: 'COMPTON' });
});

router.get('/uploader', function(req, res, next) {
  res.render('uploader', { title: 'COMPTON' });
});

module.exports = router;
