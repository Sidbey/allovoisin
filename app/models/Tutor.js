var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    specialtiesID: {type: [Schema.Types.ObjectId]},
    note: {type: Number, default: 0},
    nbHour: {type: Number, default: 0}
});

exports.model = mongoose.model('Tutor', schema, 'Tutors');