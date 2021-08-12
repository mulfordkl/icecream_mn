var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var passport = require('passport');
var session = require("express-session");
var flash = require("connect-flash");

// Set up our routers
var indexRouter = require('./routes/index');
var reviewRouter = require('./routes/reviews_routes');
var shopRouter = require('./routes/shops_routes');
var loginRouter = require('./routes/login_routes');

// Create the app
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Create our app.use statements
app.use(logger('dev'));
app.use(session({ secret: "scooty" }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

// Set up passport to handle authentication
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done) {
  done(null, user._id);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});

// This function adds the user_id to the local environment
app.use(function(req, res, next) {
  if (req.user) {
    console.log(req.user)
    res.locals.user = req.user;
  }
  next();
});

// Use our routers to handle various routes.
app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/reviews', reviewRouter);
app.use('/shops', shopRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
