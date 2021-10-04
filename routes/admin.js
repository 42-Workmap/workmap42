var express = require('express');
var router = express.Router();
var User = require('../models/User');
var locationModel = require('../models/location');
var util = require('../util');


// router.get('/', util.isLoggedin, checkPermissionAdmin, (req, res, next) => {
// 	locationModel.find({})
// 	.exec(function (err, places){
// 		res.render('admin/admin', {places:places});
// 	});
// });

router.get('/', (req, res, next) => {
	locationModel.find({})
	.sort('group')
	.exec(function (err, places){
		res.render('admin/admin', {places:places});
	});
});

router.put('/:id', function(req, res, next){
	locationModel.findOneAndUpdate({_id:req.params.id}, {$set:{group:req.body.group}}, function(err, result){
		res.redirect('/admin');
	})
})

//delete
router.delete('/:id', function(req, res, next){
	locationModel.deleteOne({_id:req.params.id}, function (err, result){
		if (err) return res.json(err);
		res.redirect('/admin');
	})
})

module.exports = router;

//private functions 
function checkPermissionAdmin(req, res, next){
	User.findOne({username:"admin"}, function(err, admin){
		if (err) return res.json(err);
		if (admin.id != req.user.id) return util.noPermission(req, res);

		next();
	});
}