var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'COMPTON' });
});


router.get('/share/:id', function(req, res, next) {
  var id = req.params.id;
  res.render('share', { id: id });
});

module.exports = router;
