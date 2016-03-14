require('../models/Offer');
require('../models/Client');

var mongoose = require('mongoose'),
    Client = mongoose.model('Client'),
    Offer = mongoose.model('Offer');

function isEmpty(input) {
    return input === undefined || input === "";
}
function isNumber(input) {
    var regexNumber = /^\d+$/;
    return input != undefined && regexNumber.test(input);
}
function isBadValue(req) {
    return isEmpty(req.body.name) || isEmpty(req.body.matter) || isEmpty(req.body.level)
        || !isNumber(req.body.nbHour) || isEmpty(req.body.plageHoraire)
        || isEmpty(req.body.plageJournaliere) || !isNumber(req.body.price);
}

var Offers = {

    index: function (req, res) {
        if (!req.session.isAuthenticated) {
            Offer.find({}, function (err, offers) {
                var promise = new Promise(function (end) {
                    var i = 0;
                    for (var k in offers) {
                        Client.findOne({tutorID: offers[k].tutorID}, function (err, tutor) {
                            offers[i]['tutor'] = tutor;
                            if (i++ == k) {
                                end();
                            }
                        });
                    }
                });
                promise.then(function () {
                    res.render('offerList', {title: 'Tutor-A', offers: offers, sess: req.session});
                });
            });
        } else {
            Client.findById(req.session.clientID, function (err, client) {
                Offer.find({}, function (err, offers) {
                    var promise = new Promise(function (end) {
                        var i = 0;
                        for (var k in offers) {
                            Client.findOne({tutorID: offers[k].tutorID}, function (err, tutor) {
                                var rlat1 = Math.PI * client.latitude / 180;
                                var rlat2 = Math.PI * tutor.latitude / 180;
                                var rtheta = Math.PI * (client.longitude - tutor.longitude) / 180;

                                var dist = Math.sin(rlat1) * Math.sin(rlat2) + Math.cos(rlat1) * Math.cos(rlat2) * Math.cos(rtheta);
                                dist = Math.acos(dist) * 180 / Math.PI * 111189.57696;

                                offers[i]['tutor'] = tutor;
                                offers[i].tutor['distance'] = Math.round(dist);
                                if (i++ == k) {
                                    end();
                                }
                            });
                        }
                    });
                    promise.then(function () {
                        res.render('offerList', {title: 'Tutor-A', offers: offers, sess: req.session});
                    });
                });
            });

        }
    },
    newOffer: function (req, res, next) {
        Client.findById(req.session.clientID, function (err, client) {
            if (req.method == 'GET') {
                if (client)
                    res.render('tutor/newOffer', {
                        title: 'Tutor-A', form: {
                            name: "", description: "", matter: "", level: "",
                            nbHour: "", plageHoraire: "", plageJournaliere: "", price: ""
                        }, sess: req.session
                    });
            } else if (req.method == 'POST') {
                console.log(typeof req.body.nbHour);
                var error = [];
                if (isBadValue(req)) {
                    error.push("Un champ est incorrect ou manquant !");
                }
                if (error.length == 0) {

                    var offer = new Offer({
                        name: req.body.name,
                        description: req.body.description,
                        matter: req.body.matter,
                        level: req.body.level,
                        tutorID: client.tutorID,
                        nbHour: parseInt(req.body.nbHour),
                        plageHoraire: req.body.plageHoraire,
                        plageJournaliere: req.body.plageJournaliere,
                        price: parseInt(req.body.price)
                    });
                    offer.save(function (err) {
                        if (err) throw err;
                        console.log('New Offer Checked In');
                    });
                    res.redirect('/tutor/dashboard');
                } else
                    res.render('tutor/newOffer', {title: 'Tutor-A', form: req.body, error: error, sess: req.session});
            }
        });

    },

    editOffer: function (req, res, next) {
        Offer.findOne({'id': req.params._id}, function (err, offer) {
            if (req.method == 'GET') {
                res.render('tutor/editOffer', {title: 'Tutor-A', offer: offer, sess: req.session});
            } else {
                if (req.method == 'POST') {
                    offer.update({
                        name: req.body.name,
                        description: req.body.description,
                        matterID: matter._id,
                        nbHour: req.body.nbHour,
                        plageHoraire: req.body.plageHoraire,
                        plageJournaliere: req.body.plageJournaliere,
                        minPrice: req.body.minPrice,
                        maxPrice: req.body.maxPrice
                    }).exec();

                    res.redirect('/tutor/offer');
                }
            }
        });
    }

};

module.exports = Offers;