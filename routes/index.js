var express = require('express');
var router = express.Router();

/* GET home page. */

router.get('*', function(req,res,next){
  res.locals.successes = req.flash('success');
  res.locals.dangers = req.flash('danger');
  res.locals.warnings = req.flash('warning');
  next();
});

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
