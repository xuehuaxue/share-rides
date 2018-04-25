const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// trip model includes host's userid, host's username, host's email and phone,
// start and end address, data, space, every member's username, and other important information.
const Trip = new Schema({
    user_id: {type: String, required: true},
    host: {type: String, required: true},
    host_email: {type: String, required: true},
    host_phone: {type: Number, required: true},
    start: {type: String, required: true},
    end: {type: String, required: true},
    date: {type: Date, required: true},
    expense: {type: Number, required: true},
    space_avaliable: {type: Number, required: true},
    note: {type: String, trim: true, maxlength: 100},
    member: {type: Array},
    start_cords: {type: Object, required: true},  // format in [long, lat]
    end_cords: {type: Object, required: true}
});

// note must be less than 100 characters!
Trip.path('note').validate(function (v) {
    return v.length < 100;
});

module.exports = mongoose.model('Trip', Trip);