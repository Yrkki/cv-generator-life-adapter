var express = require('express');
var router = express.Router();
var s3 = require('../public/javascripts/aws');

/* GET home page. */
router.get(/.*/, function (req, res, next) {
  if (req.url.length > 1) {
    // res.redirect(req.app.get('awsLocation') + req.url);

    const key = 'deploy/public' + req.url;

    params = { Bucket: process.env.S3_BUCKET_NAME, Key: key };
    const object = s3.getObject(params, function (err, data) {
      if (err) {
        console.log(err)
        res.writeHead(200, { 'Content-Type': data.ContentType });
        res.end(null, 'binary');
      } else {
        res.writeHead(200, { 'Content-Type': data.ContentType });
        res.write(data.Body, 'binary');
        res.end(null, 'binary');
      }
    });
  } else {
    res.render('index', { title: req.app.get('appName') });
  }
});

module.exports = router;
