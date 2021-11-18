var express = require('express');
var router = express.Router();
const locationModel = require('../models/location');
var puppeteer = require('puppeteer');
var user = require('../models/User');
const User = require('../models/User');
var util = require('../util');

router.post('/', function(req, res, next){
	crawler(req.body.place_url).then(homepg => {
		req.body.homepage = homepg;
		locationModel.create(req.body, function(err, place){
			if (err) {
				console.log(err);
				res.json({message:"error"});
			}
		// res.json({message:"success"});
		});
	});
});

router.get("/", (req, res, next) => {
	locationModel.find({group:{$exists:true}}, {_id:0, __v: 0}).then((result) => {
	  res.json({
		message:"success",
		data:result,
	  });
	}).catch((error) => {
	  res.json({
		message:"error",
	  });
	});
  });

router.post('/query/', function(req, res, next){
	console.log(req.body);
	reg = new RegExp(req.body.keyword);
	locationModel.find({company_name:{$regex:reg}, group:{$exists:true}}, {_id:0, _v:0}).then((result) => {
		res.json({
			message:"success", 
			data:result
		});
	}).catch((error) => {
		res.json({
			message:"error",
		});
	});
});

router.get('/getnames', function (req, res, next){
	locationModel.find({group:{$exists:true}}, {company_name:1, _id:0}).then((result) => {
		res.json({
			message:"success  get names",
			data:result,
		});
		}).catch((error) => {
		res.json({
			message:"error",
		});
	});
})

router.get("/:group", (req, res, next) => {
	locationModel.find({group:req.params.group}, {_id:0, _v:0}).then((result)=>{
		res.json({
			message:"success", 
			data:result,
		});
	}).catch((error) => {
		res.json({
			message:"error"
		});
	});
});

module.exports = router;

// private function 
const crawler = async (place_url) => {
	try {
		const browser = await puppeteer.launch({headless:true}); // 창 확인하고 싶으면 false
		const page = await browser.newPage();
		await page.goto(`${place_url}`);
		await page.waitForSelector('.link_homepage');
		if (await page.$('.link_homepage') !== null){
			let result = await page.evaluate(() => document.querySelector('.link_homepage').textContent);
			result = "https://" + result;
			await page.close();
			await browser.close();
			return result;
		} else {
			await page.close();
			await browser.close();
		}
	} catch(e) {
		console.error(e);
	}
}