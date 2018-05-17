var express = require('express');
var router = express.Router();

/* GET home page. */
router.get(/.*/, function (req, res, next) {
  if (req.url.length > 1) {
    res.redirect(req.app.get('awsLocation') + req.url);
  } else {
    res.render('index', { title: req.app.get('appName') });
  }
});

module.exports = router;
