require('../models/Offer');
require('../models/Client');
require('../models/OfferRequest');

var mongoose = require('mongoose'),
    Client = mongoose.model('Client'),
    Tutor = mongoose.model('Tutor'),
    Offer = mongoose.model('Offer'),
    OfferR = mongoose.model('OfferRequest');

var Tutors = {
    dashboard: function (req, res, next) {
        Client.findById(req.session.clientID, function (err, client) {
            Tutor.findById(client.tutorID, function (err, tutor) {
                client['note'] = tutor.note;
                client['nbHour'] = tutor.nbHour;
                client['specialtiesID'] = tutor.specialtiesID;
                Offer.find({tutorID: client.tutorID}, function (err, offers) {
                    res.render('tutor/dashboard', {title: 'Tutor-A', tutor: client, offers: offers});
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
                    res.render('tutor/dashboard', {title: 'Tutor-A', tutor: client, offers: offers});
                });
            });

        });
    },
    offerRequest: function (req, res, next) {
        Client.findById(req.session.clientID, function (err, client) {
            if (client) {
                OfferR.find({tutorID: client.tutorID}, function (err, offerRequests) {
                    if (offerRequests.length == 0)
                        return res.redirect('/?error=NoRequest');

                    new Promise(function (end) {
                        var i1 = 0;
                        for (var k1 in offerRequests) {
                            Offer.findById(offerRequests[k1].offerID, function (err, offer) {
                                offerRequests[i1]['offer'] = offer;
                                i1++;
                            });
                        }
                        var i2 = 0;
                        for (var k2 in offerRequests) {
                            Client.findById(offerRequests[k2].clientID, function (err, client) {
                                offerRequests[i2]['client'] = client;
                                if (i2++ == k2) {
                                    end();
                                }
                            });
                        }
                    }).then(function () {
                        res.render('tutor/offerRequests', {title: 'Tutor-A', offerRequests: offerRequests});
                    });
                });
            }
        });
    },
    offerRequestDecision: function (req, res, next) {
        OfferR.findById(req.body.requestID, function (err, offerRequest) {
            var state = "";
            if (req.body.decision === "accept") {
                state = "accepted";
                offerRequest.update({state: state}).exec();

            } else if (req.body.decision === "refuse") {
                state = "refused";
                offerRequest.update({state: state}).exec();
            }
            res.redirect('/tutor/offer-requests');
        });

    }
};

module.exports = Tutors;