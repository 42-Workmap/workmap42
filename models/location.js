const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const locationschema = new Schema({
	company_name : {type:String, required:true, unique:true},
	address : {type:String, required:true}, 
	lat : {type:Number, required:true}, 
	lng : {type:Number, required:true},
	category_name : {type:String}, 
	place_url : {type:String}, 
	homepage : {type:String},
	group:{type:String}, 
	brand_name : {type:String},
});

module.exports = mongoose.model("location", locationschema);