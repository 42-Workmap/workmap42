var express = require('express');
var router = express.Router();
var passport = require('../config/passport');
var locationModel = require('../models/location');

// Home
router.get('/', function(req, res){
  res.render('home/welcome', {group:"location"});
});
router.get('/about', function(req, res){
  res.render('home/about');
});

router.get('/upload', (req, res, next) => {
  res.render('maps/upload');
})

// router.get('/:id', (req, res, next) => {
//   locationModel.find({group:req.params.id})
//   .exec(function(err, groups){
//     if (err) return res.json(err);
//     res.render('home/welcome', {group:l"location"})
//   });
// });

// Login
router.get('/login', function (req,res) {
  var username = req.flash('username')[0];
  var errors = req.flash('errors')[0] || {};
  res.render('home/login', {
    username:username,
    errors:errors
  });
});

// Post Login
router.post('/login',
  function(req,res,next){
    var errors = {};
    var isValid = true;

    if(!req.body.username){
      isValid = false;
      errors.username = 'Username is required!';
    }
    if(!req.body.password){
      isValid = false;
      errors.password = 'Password is required!';
    }

    if(isValid){
      next();
    }
    else {
      req.flash('errors',errors);
      res.redirect('/login');
    }
  },
  passport.authenticate('local-login', {
    successRedirect : '/posts',
    failureRedirect : '/login'
  }
));

// Logout
router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;

//private functions 
function checkPermissionAdmin(req, res, next){
	User.findOne({username:"admin"}, function(err, admin){
		if (err) return res.json(err);
		if (admin.id != req.user.id) return util.noPermission(req, res);

		next();
	});
}