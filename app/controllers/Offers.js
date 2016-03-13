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
    console.log("BAD VALUE");
    console.log(isEmpty((req.body.name)));
    console.log(isEmpty((req.body.matter)));
    console.log(isEmpty((req.body.level)));
    console.log(isEmpty((req.body.plageHoraire)));
    console.log(isEmpty((req.body.plageJournaliere)));
    console.log(isNumber((req.body.nbHour)));
    console.log(isNumber((req.body.price)));
    return isEmpty(req.body.name) || isEmpty(req.body.matter) || isEmpty(req.body.level)
        || !isNumber(req.body.nbHour) || isEmpty(req.body.plageHoraire)
        || isEmpty(req.body.plageJournaliere) || !isNumber(req.body.price);
}

var Offers = {

    index: function (req, res) {
        Offer.find({}, function (err) {
            if (err) throw err;

        });
    },
    tutorDashboard: function (req, res, next) {
        Client.findById(req.session.clientID, function (err, client) {
            Offer.find({tutorID: client.tutorID}, function (err, offers) {
                res.render('tutor/dashboard', {title: 'Tutor-A', offers: offers});
            });
        });
    },
    newOffer: function (req, res, next) {
        Client.findById(req.session.clientID, function (err, client) {
            if (req.method == 'GET') {
                if (client)
                    res.render('tutor/newOffer', {
                        title: 'Tutor-A', form: {
                            name: "", description: "", matter: "", level: "",
                            nbHour: "", plageHoraire: "", plageJournaliere: "", price: ""
                        }
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
                    res.render('tutor/newOffer', {title: 'Tutor-A', form: req.body, error: error});
            }
        });

    },

    editOffer: function (req, res, next) {
        Offer.findOne({'id': req.params._id}, function (err, offer) {
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
    }

};

module.exports = Offers;