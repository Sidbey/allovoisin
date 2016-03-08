var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var classes = ['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e',
    '2nd', '1ere', 'Term'];

var schema = new Schema({
    name: {type: String, required: true},
    level: {type: String, enum: classes, required: true}
});

exports.model = mongoose.model('Matter', schema, 'Matters');