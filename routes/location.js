var express = require('express');
var router = express.Router();
const locationModel = require('../models/location');

router.post('/', function(req, res, next){
	locationModel.create(req.body, function(err, place){
		if (err) {
			console.log(err);
			res.json({message:"error"});
		}
		res.json({message:"success"});
	})
})
  
  router.get("/", (req, res, next) => {
	locationModel.find({}, {_id:0, __v: 0}).then((result) => {
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