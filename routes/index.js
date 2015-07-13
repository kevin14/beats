var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'COMPTON' });
});


router.get('/canvas', function(req, res, next) {
  res.render('roger', { title: 'COMPTON' });
});

module.exports = router;
