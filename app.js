var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override'); // post put 
var flash = require('connect-flash'); // user error
var session = require('express-session');
var passport = require('./config/passport');
var logger = require('morgan');
var createError = require('http-errors');
const { next } = require('cheerio/lib/api/traversing');
var app = express();

app.use(function (req, res, next) {
  if (req.url && req.url.indexOf('.htm') > -1) {
    res.header('Content-Type', 'text/html');
  }
  next();
});
// Other settings
app.set('view engine', 'ejs');
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.text({defaultCharset: 'utf-8'}));

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname+'/public'));
// app.use(function(req, res, next) {
//   console.log(req.url, req.originalUrl);
//   req.url = decodeURIComponent(req.originalUrl);
//   req.originalUrl = req.url;
//   console.log(req.url, req.originalUrl);
//   next();
// })
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

var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var urlNotEncodedParser = function(req, res, next)
{
  rawBody = '';

  req.on('data', function(chunk) {
       rawBody += chunk;

       if (rawBody.length > 1e6) requereqst.connection.destroy();
       });

  req.on('end', function() {
       req.rawBody = JSON.parse(rawBody);
       next();
       });
};


// Routes
app.use('/', require('./routes/home'));
app.use('/posts', require('./routes/posts'));
app.use('/users', require('./routes/users'));
app.use('/location', require('./routes/location'));
app.use('/admin', require('./routes/admin'));

// app.get(`/:transparam`, (req, res) => {
//   const paramDecoded = decodeURIComponent(req.params.transparam);
//   console.log(paramDecoded);
// })

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