var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('client-sessions');
var debug = require('debug')('lmmyl:app');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var detectionRouter = require('./routes/detectors.js');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
	cookieName: 'session',
	secret: process.env.LMMYL_COOKIE_SECRET,
	duration: 30 * 60 * 1000,
	activeDuration: 5 * 60 * 1000,
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/detect', detectionRouter);

app.get('/login', (req, res, next) => res.render('login', { title: 'Login -- Let Me Make You Laugh!' }));
app.get('/signup', (req, res, next) => res.render('signup', { title: 'Sign Up -- Let Me Make You Laugh!' }));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  debug("in 404 route??");
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  debug("in error handler, got err: ", err);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
