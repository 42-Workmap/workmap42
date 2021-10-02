var express = require('express');
var router = express.Router();
const locationModel = require('../models/location');

router.post("/", (req, res, next) => {
	const { title, address, lat, lng} = req.body;
	let location = new locationModel();
	location.title = title;
	location.address = address;
	location.lat = lat;
	location.lng = lng;
  
	//몽고디비에 저장 
	location.save().then(result => {
	  console.log(result);
	  res.json({
		message:"success",
	  });
	}).catch(error => {
	  console.log(error);
	  res.json({
		message:"error",
	  });
	})
  });
  
  router.get("/", (req, res, next) => {
	locationModel.find({}, {_id:0, __v: 0}).then((result) => {
	  console.log(result);
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
  
  module.exports = router;