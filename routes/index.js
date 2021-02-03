var express = require('express');
var router = express.Router();
var endpoints = require('../public/javascripts/aws');

/* serve GET request. */
router.get(/.*/, function (req, res, next) {
  console.info('Requesting:', req.url);
  allowCors(req, res);
  if (req.url.length > 1) {
    const prefix = req.app.get('prefix');
    const key = decodeURI(prefix + req.url);
    const endpointType = req.app.get('endpointType');

    console.info('Getting:', key);
    if (prefix.startsWith('http')) {
      console.info(`Redirecting: http* key: ${key}.`);
      res.redirect(301, key);
    } else {
      const location = req.app.get('location');
      if (location.includes('aws')) {
        console.info(`Using location: ${location}...`);
        if (endpointType === 'CloudFront') {
          console.info(`Accessing endpointType: ${endpointType}...`);
          const domain = req.app.get('domain');
          if (domain) {
            console.debug(`Checking data: distro domain: ${JSON.stringify(domain)}, req.hostname: ${req.hostname}, req.DomainName: ${req.DomainName}, key: ${key}`);
            const url = `https://${domain}/${key}`;
            console.info(`Redirecting: cdn url: ${url}.`);
            res.redirect(301, url);
          } else {
            console.error(`I'm a little teapot: Bad CDN distribution domain.`);
          }
        } else /* if (endpointType === 'S3') { */ {
          console.info(`Accessing endpointType: ${endpointType}...`);
          const endpoint = endpoints.endpointS3;
          params = { Bucket: process.env.S3_BUCKET_NAME, Key: key };
          const objectRequest = endpoint.getObject(params, function (err, data) {
            if (data) {
              const contentType = key.endsWith('.json') ? 'application/json' : data.ContentType;
              console.info(`Received object: contentType: ${contentType}`);
              res.writeHead(200, { 'Content-Type': contentType });
              res.write(data.Body, 'binary');
              res.end(null, 'binary');
            } else {
              console.error('Blame it on the client.')
              res.status(418);
              res.send("I'm a teapot");
            }
            if (err) { console.error(`I'm just about an average teapot: `, JSON.stringify(err)); }
          });
        }
      } else {
        console.info(`Using location: ${location}...`);
        console.info('  Retrieving:', key);
        var data = require(key);

        res.send(data);
      }
    }
  } else {
    console.info('Home.');
    res.render('index', { title: req.app.get('appName') });
  }
});

/* allow CORS. */
function allowCors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
}

module.exports = router;
