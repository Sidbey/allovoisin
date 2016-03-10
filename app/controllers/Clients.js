require('../models/Client');

var mongoose = require("mongoose"),
    Client = mongoose.model('Client');


var Clients = {

    index: function (req, res) {
        Client.find({}, function (err) {
            if (err) throw err;

        });
    },
    sign_in: function (req, res) {//POST Request
        User.findOne({pseudo: req.body.pseudo}, function (err, user) {
            if (err) throw (err);
            if (user) {
                user.comparePassword(req.body.password, function (err, isMatch) {
                    if (isMatch) {
                        res.redirect('/');
                    } else {
                        res.redirect('/?error=nouser');
                    }
                });
            }
            else {
                res.redirect('/?error=nouser');
            }
        });
    }

};

module.exports = Clients;
