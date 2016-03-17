require('../models/Offer');
require('../models/Client');
require('../models/OfferRequest');

var mongoose = require('mongoose'),
    validator = require('validator'),
    Client = mongoose.model('Client'),
    Offer = mongoose.model('Offer'),
    OfferRequest = mongoose.model('OfferRequest');

function isEmpty(input) {
    return input === undefined || input === "";
}
function isNumber(input) {
    var regexNumber = /^\d+$/;
    return input != undefined && regexNumber.test(input);
}
function isMatter(matter) {
    matterList = ['Français', 'Maths', 'PC', 'SVT', 'Anglais'];
    return matterList.indexOf(matter) != -1;
}
function isLevel(level) {
    levelList = ['Primaire', 'College', 'Lycée', 'Université'];
    return levelList.indexOf(level) != -1;
}
function isBadValue(req) {
    var regexTime = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;

    return isEmpty(req.body.name) || !isMatter(req.body.matter) || !isLevel(req.body.level)
        || !regexTime.test(req.body.horaireMin) || !regexTime.test(req.body.horaireMax)
        || isEmpty(req.body.plageJournaliere) || !isNumber(req.body.price);
}
function calculDistanceBetweenTwoPersons(client, tutor) {
    var rlat1 = Math.PI * client.latitude / 180;
    var rlat2 = Math.PI * tutor.latitude / 180;
    var rtheta = Math.PI * (client.longitude - tutor.longitude) / 180;

    var dist = Math.sin(rlat1) * Math.sin(rlat2) + Math.cos(rlat1) * Math.cos(rlat2) * Math.cos(rtheta);
    dist = Math.acos(dist) * 180 / Math.PI * 111189.57696;
    return dist;
}
function isBadValueForValidation(form) {
    var regexTime = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
    var regexDate = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/;
    return !validator.isDate(form.date) && !regexDate.test(form.date) || !regexTime.test(form.beginHour)
        || !validator.isNumeric(form.duration)
}

var Offers = {

    index: function (req, res) {
        if (!req.session.isAuthenticated) {
            Offer.find({}, function (err, offers) {
                if (offers.length == 0)
                    return res.redirect('/?error=NoOffer');
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
                    res.render('offerList', {title: 'Tutor-A', offers: offers});
                });
            });
        } else {
            Client.findById(req.session.clientID, function (err, client) {
                Offer.find({}, function (err, offers) {
                    if (offers.length == 0)
                        return res.redirect('/?error=NoOffer');
                    var promise = new Promise(function (end) {
                        var i = 0;
                        for (var k in offers) {
                            Client.findOne({tutorID: offers[k].tutorID}, function (err, tutor) {
                                offers[i]['tutor'] = tutor;

                                var dist = calculDistanceBetweenTwoPersons(client, tutor);
                                offers[i].tutor['distance'] = Math.round(dist);
                                if (i++ == k) {
                                    end();
                                }
                            });
                        }
                    });
                    promise.then(function () {
                        offers.sort(function (a, b) {
                            return a.tutor.distance - b.tutor.distance;
                        });
                        res.render('offerList', {title: 'Tutor-A', offers: offers});
                    });
                });
            });

        }
    },
    newOffer: function (req, res, next) {
        Client.findById(req.session.clientID, function (err, client) {
            if (req.method == 'GET') {
                if (client)
                    res.render('tutor/newOffer', {title: 'Tutor-A', form: {}});
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
                        plageHoraire: req.body.horaireMin + " - " + req.body.horaireMax,
                        plageJournaliere: req.body.plageJournaliere,
                        price: parseInt(req.body.price)
                    });
                    offer.save(function (err) {
                        if (err) throw err;
                        console.log('New Offer Checked In');
                    });
                    res.redirect('/tutor/dashboard');
                } else
                    res.render('tutor/newOffer', {title: 'Tutor-A', form: req.body, error: error});
            }
        });

    },
    editOffer: function (req, res, next) { // NOT IMPLEMENTED
        Offer.findById(req.params.id, function (err, offer) {
            if (req.method == 'GET') {
                res.render('tutor/editOffer', {title: 'Tutor-A', offer: offer});
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
    },
    selectOffer: function (req, res, next) {
        if (req.method == 'GET') {
            Offer.findById(req.params.id, function (err, offer) {
                if (!offer)
                    return res.redirect('/?error=NoOffer');
                Client.findOne({tutorID: offer.tutorID}, function (err, tutor) {
                    offer['tutor'] = tutor;
                    if (req.session.isAuthenticated) {
                        Client.findById(req.session.clientID, function (err, client) {
                            var dist = calculDistanceBetweenTwoPersons(client, tutor);
                            offer.tutor['distance'] = Math.round(dist);

                            res.render('offer', {title: 'Tutor-A', form: {}, offer: offer});
                        });
                    } else
                        res.render('offer', {title: 'Tutor-A', form: {}, offer: offer});
                });
            });

        } else if (req.method == 'POST') {
            var form = req.body;
            Client.findById(req.session.clientID, function (err, client) {
                var error = [];
                if (isBadValueForValidation(form)) {
                    error.push("Un champ est incorrect ou manquant !");
                }
                if (error.length == 0) {
                    Offer.findById(req.params.id, function (err, offer) {
                        var offerV = new OfferRequest({
                            offerID: req.params.id,
                            clientID: req.session.clientID,
                            tutorID: offer.tutorID,
                            date: form.date,
                            beginHour: form.beginHour,
                            duration: parseInt(form.duration, 10),
                            state: 'waiting'
                        });
                        offerV.save(function (err) {
                            if (err) throw err;
                            console.log('New Offer Request');
                        });
                        res.redirect('/client/offer-requests');
                    });
                } else {
                    Offer.findById(req.params.id, function (err, offer) {
                        if (!offer)
                            return res.redirect('/?error=noOffer');

                        Client.findOne({tutorID: offer.tutorID}, function (err, tutor) {
                            offer['tutor'] = tutor;
                            Client.findById(req.session.clientID, function (err, client) {
                                var dist = calculDistanceBetweenTwoPersons(client, tutor);
                                offer.tutor['distance'] = Math.round(dist);

                                res.render('offer', {
                                    title: 'Tutor-A',
                                    form: form,
                                    offer: offer,
                                    error: error
                                });
                            });
                        });
                    });
                }

            });
        }

    }

};

module.exports = Offers;