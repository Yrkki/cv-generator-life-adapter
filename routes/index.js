var express = require('express');
var router = express.Router();
var s3 = require('../public/javascripts/aws');

/* GET home page. */
router.get(/.*/, function (req, res, next) {
  // console.log('Requesting:', req.url);
  allowCors(req, res);
  if (req.url.length > 1) {
    const location = req.app.get('location');
    const key = decodeURI(location + req.url);
    // console.log('Getting:', key);
    if (location.startsWith('http')) {
      res.redirect(key);
    } else {
      if (req.app.get('data').includes('aws')) {
        params = { Bucket: process.env.S3_BUCKET_NAME, Key: key };
        const object = s3.getObject(params, function (err, data) {
          if (data) {
            const contentType = key.endsWith('.json') ? 'application/json' : data.ContentType;
            // console.log('contentType:', contentType);
            res.writeHead(200, { 'Content-Type': contentType });
            res.write(data.Body, 'binary');
            res.end(null, 'binary');
          } else {
            // console.log('Blame it on the client.')
            res.status(418);
            res.send("It's a teapot");

            // if (err) {
            // console.log(err.message);
            // // console.log('The error was:', err)
            // }
          }
        });
      } else {
        // console.log('Getting:', key);
        var data = require(key);

        res.send(data);
      }
    }
  } else {
    // console.log('Redirecting home.');
    res.render('index', { title: req.app.get('appName') });
  }
});

module.exports = router;

function allowCors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  // res.setHeader('Access-Control-Allow-Headers', req.headers.origin);
  res.setHeader('Access-Control-Allow-Headers', '*');
}
