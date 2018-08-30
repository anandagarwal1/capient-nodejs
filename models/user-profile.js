var mongoose = require('mongoose');

var UserProfileSchema = new mongoose.Schema({
	user_id :String,
    firstname : String,
	lastname : String,
	email : String,
	mobile_no : String,
	date_of_birth : Date,
	address : String,
	city : String,
	state : String,
	img :{ data: Buffer, contentType: String },
});

UserProfile = mongoose.model('UserProfile', UserProfileSchema);
// the above is necessary as you might have embedded schemas which you don't export

module.exports = UserProfile;