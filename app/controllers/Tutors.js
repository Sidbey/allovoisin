require('../models/Offer');
require('../models/Client');

var mongoose = require('mongoose'),
    Client = mongoose.model('Client'),
    Tutor = mongoose.model('Tutor'),
    Offer = mongoose.model('Offer');

var Tutors = {
    dashboard: function (req, res, next) {
        Client.findById(req.session.clientID, function (err, client) {
            Tutor.findById(client.tutorID, function (err, tutor) {
                for (var k in tutor) {
                    client[k] = tutor[k];
                }
                Offer.find({tutorID: client.tutorID}, function (err, offers) {
                    res.render('tutor/dashboard', {title: 'Tutor-A', tutor: client, offers: offers, sess: req.session});
                });
            });
        });
    },
    publicProfil: function (req, res, next) {
        Tutor.findById(req.params.id, function (err, tutor) {

        });
    }
};

module.exports = Tutors;