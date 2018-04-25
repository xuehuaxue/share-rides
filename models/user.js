const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');


// user model includes username, phone number and email
const User = new Schema({
    username: {type:String, required:true},
    phone: {type:Number, required:true},
    email: {type: String, required:true}
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
