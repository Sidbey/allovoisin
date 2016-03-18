var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    contents: {type: String, required: true},
    note: {type: Number, required: true},
    authorID: {type: Schema.Types.ObjectId, required: true}
});

exports.model = mongoose.model('Message', schema, 'Messages');