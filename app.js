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
  "http": {
    "port": 2500,
    "hosts": [
      "localhost",
      "192.168.1.2"
    ]
  },
  "data": {
    "default": "public",
    "aws": "deploy/public"
  }
});

// compress responses
app.use(compression());

const data = (process.env.CV_GENERATOR_LIFE_ADAPTER_DATA || 'default');
app.set('data', data);
const location = nconf.get('data:' + data);
app.set('location', location);
// console.log('Data location: [%s:%s]', data, location);

const fileBasedLocation = location.startsWith('http') ? app.get('internal') : location;
app.set('fileBasedLocation', fileBasedLocation);
// console.log('Fallback data location: [%s]\n', fileBasedLocation);

// load app icon
var faviconPath = path.join(__dirname, fileBasedLocation, 'favicon.ico');
if (fs.existsSync(faviconPath)) {
  app.use(favicon(faviconPath));
}

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, location), { maxAge: '1w' }));

app.use(cors());

/* Redirect http to https */
app.get('*', function (req, res, next) {
  if (req.headers['x-forwarded-proto'] != 'https' && !nconf.get('http:hosts').includes(req.hostname)) {
    var url = 'https://' + req.hostname;
    // var port = app.get('port');
    // if (port)
    //   url += ":" + port;
    url += req.url;
    res.redirect(url);
  }
  else
    next() /* Continue to other routes if we're not redirecting */
});

app.use('/', indexRouter);

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
