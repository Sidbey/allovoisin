require('../models/Client');
require('../models/Tutor');

var mongoose = require('mongoose'),
    validator = require('validator'),
    Client = mongoose.model('Client'),
    Tutor = mongoose.model('Tutor');

const Geoloc = require('./utils/Geoloc');


function isEmpty(input) {
    return input === undefined || input === "";
}
function isNotNumber(input) {
    var regexNumber = /^\d+$/;
    return input === undefined || !regexNumber.test(input);
}
function isNumber(input) {
    var regexNumber = /^\d+$/;
    return input != undefined && regexNumber.test(input);
}
function isBadValue(form) {
    return isEmpty(form.firstName, 'fr-FR') || isEmpty(form.lastName, 'fr-FR') || isNotNumber(form.age)
        || isEmpty(form.road) || /*isNotNumber(form.postalCode) ||*/ isEmpty(form.city) || isEmpty(form.country);
}
function completeAddress(user) {
    return user.road + ", " + /*user.postalCode + " " +*/ user.city + ", " + user.country;
}
var Clients = {
    index: function (req, res) {
        Client.find({}, function (err) {
            if (err) throw err;

        });
    },
    signIn: function (req, res, next) {//POST Request
        Client.findOne({'email': req.body.email}, function (err, client) {
            if (err) throw (err);
            var error = [];
            var checkLogin = new Promise(function (render) {
                if (client) {
                    client.comparePassword(req.body.password, function (err, isMatch) {
                        if (isMatch) {
                            req.session.isAuthenticated = true;
                            req.session.clientID = client._id;
                            req.session.isTutor = (client.tutorID) ? true : false;
                            res.redirect('/client/profil');
                        } else {
                            error.push("L'email ou le mot de passe est incorrect !");
                        }
                    });
                } else {
                    error.push("L'email ou le mot de passe est incorrect !");
                }
                render();
            });
            checkLogin.then(function () {
                if (error.length != 0) {
                    res.render('signIn', {title: 'Tutor-A', form: req.body, error: error, sess: req.session});
                }
            });
        });
    },
    signOut: function (req, res, next) { // GET Request
        req.session.isAuthenticated = false;
        req.session.clientID = "";
        res.redirect('/');
    },
    signUp: function (req, res, next) { // POST Request
        var client = req.body;
        Client.findOne({'email': client.email}, function (err, clientInBase) {
            var errors = [];
            if (clientInBase)
                errors.push("L'email est déja utilisé par un autre client !");

            if (isBadValue(client) || isEmpty(client.password) || !validator.isEmail(client.email))
                errors.push("Un champ est incorrect ou manquant !");

            if (client.password != client.confirmPass)
                errors.push("Les mdp ne correspondent pas !");

            if (errors.length === 0) {
                // Envoie d'une requête à l'API de Google Maps
                var address = completeAddress(client);
                Geoloc.getLocalisationData(address)
                    .then(locData => {
                        Object.assign(client, locData);
                        console.log(client);
                        return Client(client).save();
                    })
                    .then(savedClient => {
                        console.log('New client inscription : ' + savedClient.email);
                        req.session.isAuthenticated = true;
                        req.session.clientID = savedClient._id;
                        req.session.isTutor = false;
                        res.redirect('/client/profil');
                    })
                    .catch(error => {
                        console.error(error);
                        errors.push(error);
                        res.render('signUp', {title: 'Tutor-A', form: req.body, error: errors, sess: req.session});
                    });
            } else
                res.render('signUp', {title: 'Tutor-A', form: req.body, error: errors, sess: req.session});


        });
    },
    profil: function (req, res, next) { // GET Request
        Client.findById(req.session.clientID, function (err, client) {
            if (client)
                res.render('client/profil', {title: 'Tutor-A', client: client, sess: req.session});
        });
    },
    editProfil: function (req, res, next) {
        Client.findById(req.session.clientID, function (err, client) {
            if (req.method == 'GET') {
                res.render('client/editProfil', {title: 'Tutor-A', form: client, sess: req.session});
            } else if (req.method == 'POST') {
                var form = req.body;
                var errors = [];

                if (isBadValue(form))
                    errors.push("Un champ est incorrect ou manquant !");

                if (errors.length === 0) {
                    var address = completeAddress(form);
                    Geoloc.getLocalisationData(address)
                        .then(locData => {
                            Object.assign(form, locData);
                            console.log(form);
                            return client.update(form);
                        })
                        .then(savedClient => {
                            res.redirect('/client/profil');
                        })
                        .catch(error => {
                            console.error(error);
                            errors.push(error);
                            res.render('client/editProfil', {
                                title: 'Tutor-A',
                                form: form,
                                error: errors,
                                sess: req.session
                            });
                        });
                } else
                    res.render('client/editProfil', {
                        title: 'Tutor-A',
                        form: form,
                        error: errors,
                        sess: req.session
                    });
            }
        });
    },
    editPassword: function (req, res, next) {
        Client.findById(req.session.clientID, function (err, client) {
            if (req.method == 'GET') {
                res.render('client/editPassword', {title: 'Tutor-A', sess: req.session});
            } else if (req.method == 'POST') {
                var form = req.body;
                var errors = [];

                if (isEmpty(form.password))
                    errors.push("Un champ est incorrect ou manquant !");

                if (form.password != form.confirmPass)
                    errors.push("Les mdp ne correspondent pas !");

                if (errors.length === 0) {
                    console.log(form);
                    Object.assign(client, form);
                    client.save()
                        .then(savedClient => {
                            res.redirect('/client/profil');
                        })
                        .catch(error => {
                            console.error(error);
                            errors.push(error);
                            res.render('client/editPassword', {
                                title: 'Tutor-A',
                                error: errors,
                                sess: req.session
                            });
                        });
                } else
                    res.render('client/editPassword', {
                        title: 'Tutor-A',
                        error: errors,
                        sess: req.session
                    });
            }
        });
    },
    tutorUpgrade: function (req, res, next) {
        Client.findById(req.session.clientID, function (err, client) {
            if (client) {
                var tutor = new Tutor({});
                tutor.save(function (err) {
                    console.log("New Tutor upgrade");
                });
                client.update({tutorID: tutor._id}).exec();
                req.session.isTutor = true;

            }
            res.render('client/profil', {title: 'Tutor-A', client: client, sess: req.session});
        });
    }

};

module.exports = Clients;
