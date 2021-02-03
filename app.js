#!/usr/bin/env node

'use strict';

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var cors = require('cors');
var nconf = require('nconf');
var favicon = require('serve-favicon');
var fs = require('fs');
var compression = require('compression');

var indexRouter = require('./routes/index');

var app = express();

app.set('appName', 'Life Adapter');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// set up congifuration
nconf.argv().env();
nconf.file({ file: 'config.json' });
nconf.defaults({
  "appName": "cv-generator-life-adapter",
  "debug": "false",
  "endpointType": "CloudFront",
  "http": {
    "port": 2500,
    "hosts": [
      "localhost",
      "192.168.1.2",
      "192.168.1.6"
    ]
  },
  "location": {
    "default": "public",
    "aws": "deploy/public",
    "s3": "https://<bucket>.<region>.amazonaws.com/deploy/public",
    "cdn": "https://<distribution>.cloudfront.net/deploy/public"
  },
  "locationSelector": "cdn",
  "skipRedirectToHttps": false,
  "useSpdy": false
});

// compress responses
app.use(compression());

/* Map environment to configuration. */
function mapEnv2Config(message, envVar, configKey, defaultValue, key = configKey) {
  const retVal = (envVar || nconf.get(configKey) || defaultValue);
  app.set(key, retVal);
  console.info(`${message}: ${retVal}`);
  return retVal;
}

// map environment to configuration
console.log();
const appName = mapEnv2Config('Application name', process.env.CV_GENERATOR_LIFE_ADAPTER_APP_NAME, 'appName', false);
const debug = mapEnv2Config('Debug mode', process.env.CV_GENERATOR_LIFE_ADAPTER_DEBUG, 'debug', false);
const endpointType = mapEnv2Config('Endpoint type', process.env.CV_GENERATOR_LIFE_ADAPTER_ENDPOINT_TYPE, 'endpointType', 'CloudFront');
const location = mapEnv2Config('Data location', process.env.CV_GENERATOR_LIFE_ADAPTER_LOCATION, 'locationSelector', 'default');
const prefix = mapEnv2Config('Data prefix', process.env['CV_GENERATOR_LIFE_ADAPTER_LOCATION_' + location.toUpperCase()],
  'location:' + location, 'https://<distribution>.cloudfront.net/deploy/public', 'prefix');
const skipRedirectToHttps = mapEnv2Config('Skip redirect to https', process.env.CV_GENERATOR_LIFE_ADAPTER_SKIP_REDIRECT_TO_HTTPS, 'skipRedirectToHttps', false);
const useSpdy = mapEnv2Config('Use HTTP/2', process.env.CV_GENERATOR_LIFE_ADAPTER_USE_SPDY, 'useSpdy', false);
console.log();

// override console log
var overrideConsoleLog = require('./override-console-log');
overrideConsoleLog(debug);

// set up CDN domain name
var endpoints = require('./public/javascripts/aws');
if (location.includes('aws')) {
  console.info(`Using location: ${location}...`);
  if (endpointType === 'CloudFront') {
    console.info(`Accessing endpointType: ${endpointType}...`);
    const endpoint = endpoints.endpointCloudFront;
    const distributionsRequest = endpoint.listDistributions((err, data) => {
      if (data) {
        const domain = data.DistributionList?.Items?.[0].DomainName;
        if (domain) {
          app.set('domain', domain);
          console.info(`domain: ${domain}`);
        } else {
          console.error(`I'm a little teapot: Bad CDN distribution domain.`);
        }
      };
      if (err) { console.error(`I'm a big teapot: `, JSON.stringify(err)); }
    });
  }
}

// load app icon
var faviconPath = path.join(__dirname, 'public/favicon', 'favicon.ico');
if (fs.existsSync(faviconPath)) {
  app.use(favicon(faviconPath));
}

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(cors());

// Redirect http to https
/*eslint complexity: ["error", 5]*/
app.get('*', function (req, res, next) {
  console.debug(`get: req.protocol: ${req.protocol}`);
  if ((!req.secure || req.headers['x-forwarded-proto'] !== 'https') &&
    !['true', 'TRUE'].includes(skipRedirectToHttps) &&
    !nconf.get('http:hosts').includes(req.hostname)
  ) {
    var url = 'https://';
    url += req.hostname;
    url += req.url;
    res.redirect(301, url);
  }
  else
    next() /* Continue to other routes if we're not redirecting */
});

app.use('/', indexRouter);
app.use(express.static(path.join(__dirname, location), { maxAge: '1w' }));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
