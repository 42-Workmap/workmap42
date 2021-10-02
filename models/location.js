const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const locationschema = new Schema({
	title : {type:String, required:true},
	address : {type:String, required:true}, 
	lat : {type:Number, required:true}, 
	lng : {type:Number, required:true},
});

module.exports = mongoose.model("location", locationschema);