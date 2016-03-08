var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    name: {type: String, required: true},
    description: {type: String, default: ""},
    matterID: {type: Number, required: true},
    tutorID: {type: Number, required: true},
    nbHour: {type: Number, required: true},
    plageHoraire: {type: String, required: true},
    plageJournaliere: {type: String, required: true},
    minPrice: {type: Number, required: true},
    maxPrice: {type: Number, required: true}
});

exports.model = mongoose.model('Offer', schema, 'Offers');