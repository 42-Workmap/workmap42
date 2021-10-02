var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override'); // post put 
var flash = require('connect-flash'); // user error
var session = require('express-session');
var passport = require('./config/passport');
var userConfig = require('./config/userConfig.json');
var logger = require('morgan');
var createError = require('http-errors');
var app = express();

// Other settings
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.static(__dirname+'/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride('_method'));
app.use(flash());
app.use(session({secret:'MySecret', resave:true, saveUninitialized:true})); // 사용자 구분 

// Passport
app.use(passport.initialize());
app.use(passport.session());

//Custom middlewares
app.use(function(req, res, next){
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.currentUser = req.user;
  next();
})

// Routes
app.use('/', require('./routes/home'));
app.use('/posts', require('./routes/posts'));
app.use('/users', require('./routes/users'));

// catch 404 and forward to error handler 
// MUST be after Routes 
app.use(function(req, res, next){
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