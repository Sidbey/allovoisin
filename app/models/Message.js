var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    contents: {type: String, required: true},
    senderID: {type: Number, required: true},
    receiverID: {type: Number, required: true}
});

exports.model = mongoose.model('Message', schema, 'Messages');