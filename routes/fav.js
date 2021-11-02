var express = require('express');
var router = express.Router();
const locationModel = require('../models/location');
var puppeteer = require('puppeteer');
var user = require('../models/User');
const User = require('../models/User');
var util = require('../util');

router.post('/', function(req, res){
	reg = new RegExp(req.body.targetName);
	locationModel.find({company_name:{$regex:reg}, group:{$exists:true}}, {_id:0, _v:0}).then((result) => {
		User.findOneAndUpdate({_id:req.user._id}, {$addToSet:{favorites: result[0]}}, function(err, user){
			if(err){
				console.log(err);
			//   req.flash('post', req.body);
			//   req.flash('errors', util.parseError(err));
			   return res.redirect('/');
			}
			res.json({
				message:"success",
				data:user,
			});
		  })
	}).catch((error) => {
		res.json({
			message:"error",
		});
	});
});

// Favorite 
router.get('/', function (req, res, next){
	User.findOne({_id:req.user._id}, function (err, user){
	  let favs = [];
	  for (let i = 0; i <user.favorites.length; i++){
		  favs.push(user.favorites[i][0]);
	  }
	  res.json({
		  message:"success", 
		  data:favs
	  })
	});
  });

router.put('/update', function (req, res){
	User.findOneAndUpdate({_id:req.user._id}, {$pull:{favorites: req.body.targetName}}, function (err, user){
		console.log(user.favorites);
		res.json({
			message:"success", 
		})
	  });
})

module.exports = router;
