var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    name: {type: String, required: true},
    description: {type: String, default: ""},
    matter: {type: String, required: true},
    level: {type: String, required: true},
    tutorID: {type: Schema.Types.ObjectId, required: true},
    plageHoraire: {type: String, required: true},
    plageJournaliere: {type: String, required: true},
    price: {type: Number, required: true}
});

exports.model = mongoose.model('Offer', schema, 'Offers');