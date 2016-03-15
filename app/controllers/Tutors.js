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
                client['note'] = tutor.note;
                client['nbHour'] = tutor.nbHour;
                client['specialtiesID'] = tutor.specialtiesID;
                Offer.find({tutorID: client.tutorID}, function (err, offers) {
                    res.render('tutor/dashboard', {title: 'Tutor-A', tutor: client, offers: offers, sess: req.session});
                });
            });
        });
    },
    publicProfil: function (req, res, next) {
        Tutor.findById(req.params.id, function (err, tutor) {
            if (!tutor) {
                res.redirect('/?error=NoTutor');
                return;
            }
            Client.findOne({tutorID: tutor._id}, function (err, client) {
                client['note'] = tutor.note;
                client['nbHour'] = tutor.nbHour;
                client['specialtiesID'] = tutor.specialtiesID;
                Offer.find({tutorID: client.tutorID}, function (err, offers) {
                    res.render('tutor/dashboard', {title: 'Tutor-A', tutor: client, offers: offers, sess: req.session});
                });
            });

        });
    }
};

module.exports = Tutors;