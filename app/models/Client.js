var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Address = mongoose.model('Address'),
    bcrypt = require('bcrypt-nodejs'),
    SALT = 42;

var schema = new Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    addressID: {type: Number, required: true},
    isTutor: {type: Boolean, default: false}
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
            console.log("salt = " + salt);
            console.log("pwd = " + user.password);
            user.password = hash;
            console.log("hash pwd = " + user.password);
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