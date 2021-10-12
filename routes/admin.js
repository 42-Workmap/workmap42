var express = require('express');
var router = express.Router();
var User = require('../models/User');
var locationModel = require('../models/location');
var util = require('../util');
var puppeteer = require('puppeteer');
var fs = require('fs');

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
	console.log(req.body);
	if (req.body.homepage) {
		locationModel.findOneAndUpdate({_id:req.params.id}, {$set:{group:req.body.group, homepage:req.body.homepage}}, function(err, result){
			res.redirect('/admin');
		});
	} else {
		locationModel.findOneAndUpdate({_id:req.params.id}, {$set:{group:req.body.group}}, function(err, result){
			res.redirect('/admin');
		});
	}
	// crawler(req.body.place_url).then(homepg => {
	// 	locationModel.findOneAndUpdate({_id:req.params.id}, {$set:{group:req.body.group, homepage:homepg}}, function(err, result){
	// 		res.redirect('/admin');
	// 	});
	// })
	
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

// const crawler = async (place_url) => {
// 	try {
// 		const browser = await puppeteer.launch({headless:true}); // 창 확인하고 싶으면 false
// 		const page = await browser.newPage();
// 		await page.goto(`${place_url}`);
// 		await page.waitForSelector('.link_homepage');
// 		if (await page.$('.link_homepage') !== null){
// 			let result = await page.evaluate(() => document.querySelector('.link_homepage').textContent);
// 			result = "http://" + result;
// 			await page.close();
// 			await browser.close();
// 			return result;
// 		} else {
// 			await page.close();
// 			await browser.close();
// 		}
// 	} catch(e) {
// 		console.error(e);
// 	}
// }