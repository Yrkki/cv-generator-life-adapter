var express = require('express');
var router = express.Router();
var s3 = require('../public/javascripts/aws');

/* GET home page. */
router.get(/.*/, function (req, res, next) {
  AllowCors(res);

  if (req.url.length > 1) {
    const location = req.app.get('location');
    // console.log('Getting:', location + req.url);
    if (location.startsWith('http')) {
      res.redirect(location + req.url);
    } else {
      const key = decodeURI(path.resolve(location, req.url));
      // console.log('Will request the following key:', key);

      if (req.app.get('data').includes('aws')) {
        params = { Bucket: process.env.S3_BUCKET_NAME, Key: key };
        const object = s3.getObject(params, function (err, data) {
          if (err) {
            // console.log(err.message);
            if (data) {
              // console.log('Gracefully cover up.')
              res.writeHead(200, { 'Content-Type': data.ContentType });
              res.end(null, 'binary');
            } else {
              // console.log('Blame it on the client.')
              res.status(418);
              res.send("It's a teapot");
            }
            // // console.log('The error was:', err)
            // console.log('The request was:', req);
          } else {
            res.writeHead(200, { 'Content-Type': data.ContentType });
            res.write(data.Body, 'binary');
            res.end(null, 'binary');
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

function AllowCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', req.headers.origin);
}
