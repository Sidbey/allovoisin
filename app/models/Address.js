var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    road: {type: String, required: true},
    postalCode: {type: Number, required: true},
    city: {type: String, required: true},
    country: {type: String, required: true}
});

exports.model = mongoose.model('Address', schema, 'Address');