var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    contents: {type: String, required: true},
    senderID: {type: Schema.Types.ObjectId, required: true},
    receiverID: {type: Schema.Types.ObjectId, required: true}
});

exports.model = mongoose.model('Message', schema, 'Messages');