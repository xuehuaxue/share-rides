const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
    note: {type: String},
    member: {type: Array}
});


module.exports = mongoose.model('Trip', Trip);