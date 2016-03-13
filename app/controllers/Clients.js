require('../models/Client');
require('../models/Tutor');

var mongoose = require('mongoose'),
    Client = mongoose.model('Client'),
    Tutor = mongoose.model('Tutor'),
    https = require('https');


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
function isValidEmail(email) {
    var regexEmail = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.([a-z]+)|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
    return !regexEmail.test(email);
}
function isBadValue(req) {
    return isEmpty(req.body.firstName) || isEmpty(req.body.lastName) || isValidEmail(req.body.email)
        || isEmpty(req.body.password) || isNotNumber(req.body.age)
        || isEmpty(req.body.road) || /*isNotNumber(req.body.postalCode) ||*/ isEmpty(req.body.city) || isEmpty(req.body.country);
}
var Clients = {

        index: function (req, res) {
            Client.find({}, function (err) {
                if (err) throw err;

            });
        },
        signIn: function (req, res, next) {//POST Request
            if (req.session.isAuthenticated) {
                res.redirect('/?error=alreadyConnected');
                return;
            }
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
                        res.render('signIn', {title: 'Tutor-A', form: req.body, error: error});
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
            if (req.session.isAuthenticated) {
                res.redirect('/?error=alreadyConnected');
                return;
            }
            Client.findOne({'email': req.body.email}, function (err, clientInBase) {
                var error = [];
                if (clientInBase) {
                    error.push("L'email est déja utilisé par un autre client !");
                }

                if (isBadValue(req)) {
                    error.push("Un champ est incorrect ou manquant !");
                }

                if (req.body.password != req.body.confirmPass) {
                    error.push("Les mdp ne correspondent pas !");
                }

                // Envoie d'une requête à l'API de Google Maps
                var searchAddressOnMaps = new Promise(function (saveInBase) {
                    var datasMaps = "";
                    var address = req.body.road + ", " + /* req.body.postalCode + " " +*/ req.body.city + ", " + req.body.country;
                    var options = {
                        host: "maps.googleapis.com",
                        path: '/maps/api/geocode/json?address=' + address.replace(/\s/g, "+") + '&key=AIzaSyA2Uh8w2_q63RDbAkyXrL6VauMCVc0_slU'
                    };
                    https.get(options, function (res) {
                        res.setEncoding('utf8');
                        res.on('data', function (chunk) {
                            datasMaps += chunk;
                        });
                        res.on('end', function () {
                            //console.log(datasMaps);
                            datasMaps = JSON.parse(datasMaps);
                            console.log("ADRESSE\n" + datasMaps.results[0].address_components[0].types[0]);
                            console.log("ADRESSE\n" + datasMaps.results[0].address_components[0].long_name);
                            if (datasMaps.status != "OK")
                                error.push("L'adresse est introuvable !");
                            if (datasMaps.results[0].address_components[0].types[0] != 'street_number')
                                error.push("L'adresse n'est pas complète !");
                            saveInBase(datasMaps);
                        });
                    });
                });
                // Enregistrement du client en base
                searchAddressOnMaps.then(function (datasMaps) {
                    if (error.length == 0) {
                        var addressComponents = datasMaps.results[0].address_components;
                        var coordinates = datasMaps.results[0].geometry.location;

                        var client = new Client({
                            email: req.body.email,
                            password: req.body.password,
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            age: parseInt(req.body.age, 10),

                            road: addressComponents[0].long_name + " " + addressComponents[1].long_name,
                            postalCode: parseInt(addressComponents[6].long_name, 10),
                            city: addressComponents[2].long_name,
                            country: addressComponents[5].long_name,
                            latitude: coordinates.lat,
                            longitude: coordinates.lng
                        });
                        client.save(function (err) {
                            if (err) throw err;
                            console.log('New client inscription');
                        });
                        req.session.isAuthenticated = true;
                        req.session.clientID = client._id;
                        req.session.isTutor = false;
                        res.redirect('/client/profil');

                        console.log(address);
                    } else
                        res.render('signUp', {title: 'Tutor-A', form: req.body, error: error});
                });

            });
        },
        profil: function (req, res, next) { // GET Request
            Client.findById(req.session.clientID, function (err, client) {
                if (client)
                    res.render('client/profil', {title: 'Tutor-A', client: client});
            });
        },
        editProfil: function (req, res, next) {
            Client.findById(req.session.clientID, function (err, client) {
                if (req.method == 'GET') {
                    res.render('client/editProfil', {title: 'Tutor-A', client: client});
                } else if (req.method == 'POST') {
                    var inputIsUpdate = new Promise(function (render) {
                            if (client) {
                                if (!isEmpty(req.body.firstName))
                                    client.update({firstName: req.body.firstName}).exec();
                                if (!isEmpty(req.body.lastName))
                                    client.update({lastName: req.body.lastName}).exec();
                                if (isNumber(req.body.age))
                                    client.update({age: req.body.age}).exec();
                                if (!isEmpty(req.body.password))
                                    if (req.body.password == req.body.confirmPass)
                                        client.update({password: req.body.password}).exec();
                                if (!isEmpty(req.body.road) && /*!isEmpty(req.body.postalCode)
                                     && */ !isEmpty(req.body.city) && !isEmpty(req.body.country)) {
                                    var datasMaps = "";
                                    var address = req.body.road + ", " + /*req.body.postalCode + " " +*/ req.body.city + ", " + req.body.country;
                                    console.log(address);
                                    var options = {
                                        host: "maps.googleapis.com",
                                        path: '/maps/api/geocode/json?address=' + address.replace(/\s/g, "+") + '&key=AIzaSyBh-ZMhtx_g97Xs2ZLBryqd8ldApqo_veI'
                                    };
                                    https.get(options, function (res) {
                                            res.setEncoding('utf8');
                                            res.on('data', function (chunk) {
                                                console.log(chunk);
                                                datasMaps += chunk;
                                            });
                                            res.on('end', function () {
                                                datasMaps = JSON.parse(datasMaps);
                                                if (datasMaps.status == "OK"
                                                    && datasMaps.results[0].address_components[0].types[0] == 'street_number') {
                                                    var addressComponents = datasMaps.results[0].address_components;
                                                    var coordinates = datasMaps.results[0].geometry.location;
                                                    client.update({
                                                        road: addressComponents[0].long_name + " " + addressComponents[1].long_name,
                                                        postalCode: parseInt(addressComponents[6].long_name, 10),
                                                        city: addressComponents[2].long_name,
                                                        country: addressComponents[5].long_name,
                                                        latitude: coordinates.lat,
                                                        longitude: coordinates.lng
                                                    }).exec();
                                                }
                                                render();
                                            });
                                        }
                                    );
                                } else
                                    render();
                            }
                        }
                        )
                        ;
                    inputIsUpdate.then(function () {
                        res.redirect('/client/profil');
                    });

                }
            })
            ;
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
                res.render('client/profil', {title: 'Tutor-A', client: client});
            });
        }

    }
    ;

module.exports = Clients;
