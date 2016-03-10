require('../models/Offer');
require('../models/Client');
require('../models/Matter');

var mongoose = require('mongoose'),
    Matter = mongoose.model('Matter'),
    Client = mongoose.model('Client'),
    Offer = mongoose.model('Offer');

var Offers = {

    index: function (req, res) {
        Offer.find({}, function (err) {
            if (err) throw err;

        });
    },
    
    newOffer: function (req, res, next) {
        var matter = new Matter({
            name: req.body.name,
            level: req.body.level
        });
        matter.save(function (err) {
            if (err) throw err;
            console.log('New Matter Checked In');
        });
        var tutorId;
        Client.findOne({
            email: req.session.email
        }, function(err, client){
            tutorId = client.tutorID
        });
 
        var offer = new Offer({
            name: req.body.name,
            description: req.body.description,
            matterID: matter._id,
            tutorID: tutorId,
            nbHour: req.body.nbHour,
            plageHoraire: req.body.plageHoraire,
            plageJournaliere: req.body.plageJournaliere,
            minPrice: req.body.minPrice,
            maxPrice: req.body.maxPrice
        });
        offer.save(function (err) {
            if (err) throw err;
            console.log('New Offer Checked In');
        });
        res.redirect('/tutor/offer');

    },
    
    editOffer: function (req, res, next) {
        Offer.findOne({'id': req.param._id}, function (err, offer) {
            if (req.method == 'GET') {
                res.render('offer/editOffer', {title: 'Tutor-A', offer: offer});
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