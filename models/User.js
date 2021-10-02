var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var userSchema = mongoose.Schema({
	username:{
		type:String, 
		required:[true, 'Username is required'], 
		match:[/^.{4,12}$/,'Should be 4-12 characters!'],
		trim:true, // 빈칸이 있는 경우 빈칸을 제거해준다 
		unique:true}, 
	password:{
		type:String, 
		required:[true, 'Password is required'], 
		select:false}, 
	name:{
		type:String, 
		required:[true, 'Name is required'], 
		match:[/^.{4,12}$/, 'Should be 4-12 characters!'], 
		trim:true}, 
	email:{
		type:String, 
		match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,'Should be a vaild email address!'], 
		trim:true}
}, {
	toObject:{virtuals:true}
});
//select:false DB에서 해당값을 읽어오지 않는다 
  

//viruatls  DB에 값 이외의 항목이 필요할 떄 virtual 항목을 만든다
// passwordConfirmation, originalPassword, currentPassword, newPassword와 같이 저장할필요는 없지만 회원가입할 떄 필요한 가상 항목 
userSchema.virtual('passwordConfirmation')
  .get(function(){ return this._passwordConfirmation; })
  .set(function(value){ this._passwordConfirmation=value; });

userSchema.virtual('originalPassword')
  .get(function(){ return this._originalPassword; })
  .set(function(value){ this._originalPassword=value; });

userSchema.virtual('currentPassword')
  .get(function(){ return this._currentPassword; })
  .set(function(value){ this._currentPassword=value; });

userSchema.virtual('newPassword')
  .get(function(){ return this._newPassword; })
  .set(function(value){ this._newPassword=value; });


// password Regex added
var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
var passwordRegexErrorMessage = 'Should be minimum 8 characters of alphabet and number combination!';
//password validation 
userSchema.path('password').validate(function(v){
	var user = this;

	// create user 회원가입 단계인지 확인할 수 있는 isNew true면 회원가입 
	if (user.isNew){ // 회원가입에서는 비밀번호 컴폼 이나 재확인에서 오류 두 가지를 거쳐야 한다 
		if (!user._passwordConfirmation){
			user.invalidate('passwordConfirmation', 'PasswordConfirmation is required');
		}
		if (!passwordRegex.test(user.password)){
			user.invalidate('password', passwordRegexErrorMessage);
		}
		else if (user.password !== user._passwordConfirmation){
			user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
		}
	} 

	// 정규표현식.test(문자열) 
	// update user false인 경우로 회원정부 수정이다 
	if (!user.isNew){ // 회원 수정단계에서는 원래 패스워드가 맞는지, 컨폼 그리고 재확인 3단계를 거쳐야 한다
		if (!user.currentPassword){
			user.invalidate('currentPassword', 'Current Password is required');
		} else if (!bcrypt.compareSync(user.currentPassword != user.originalPassword)){
			user.invalidate('currentPassword', 'Current Password is invalid');
		}

		if (user.newPassword && !passwordRegex.test(user.newPassword)){
			user.invalidate('newPassword', passwordRegexErrorMessage)
		} else if (user.newPassword !== user.passwordConfirmation){
			user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
		}
	}
});


//hash password
userSchema.pre('save', function(next){
	var user = this;
	if (!user.isModified('password')){
		return next();
	} else {
		user.password = bcrypt.hashSync(user.password);
		return next();
	}
});

userSchema.methods.authenticate = function (password){
	var user = this;
	return bcrypt.compareSync(password, user.password);
}

var User = mongoose.model('user', userSchema);
module.exports = User;