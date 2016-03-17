var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt-nodejs'),
    SALT = 42;

var schema = new Schema({
    email: {type: String, required: true},
    password: {type: String, required: true},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    age: {type: String, required: true},
    tutorID: {type: Schema.Types.ObjectId, default: null},

    road: {type: String, required: true},
    postalCode: {type: String, required: true},
    city: {type: String, required: true},
    country: {type: String, required: true},
    latitude: {type: Number, required: true},
    longitude: {type: Number, required: true}
});

//Appelé avant d'effectuer la sauvegarde d'un utilisateur
schema.pre('save', function (next) {
    var user = this;
    // si le mot de passe est modifié ou crée
    if (!user.isModified('password')) return next();
    bcrypt.genSalt(SALT, function (err, salt) {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, null, function (err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

schema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};


exports.model = mongoose.model('Client', schema, 'Clients');