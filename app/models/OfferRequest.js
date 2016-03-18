var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    offerID: {type: Schema.Types.ObjectId, required: true},
    clientID: {type: Schema.Types.ObjectId, required: true},
    tutorID: {type: Schema.Types.ObjectId, required: true},
    date: {type: String, required: true},
    beginHour: {type: String, required: true},
    duration: {type: Number, required: true},
    state: {type: String, enum: ['waiting', 'accepted', 'refused'], required: true}
});

exports.model = mongoose.model('OfferRequest', schema, 'OfferRequests');