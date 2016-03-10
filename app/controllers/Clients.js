require('../models/Client');

var mongoose = require('mongoose'),
    Client = mongoose.model('Client'),
    https = require('https');


function isEmpty(input) {
    return input === undefined || input === "";
}
function isNotNumber(input) {
    var regexNumber = /^\d+$/;
    return input === undefined || !regexNumber.test(input);
}
function isValidEmail(email) {
    var regexEmail = /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.([a-z]+)|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;

    return !regexEmail.test(email);
}
function isBadValue(req) {
    return isEmpty(req.body.firstName) || isEmpty(req.body.lastName) || isValidEmail(req.body.email)
        || isEmpty(req.body.password) || isNotNumber(req.body.age)
        || isEmpty(req.body.road) || isNotNumber(req.body.postalCode) || isEmpty(req.body.city) || isEmpty(req.body.country);
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
                            req.session.email = client.email;
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
    signOut: function (req, res, next) {
        req.session.isAuthenticated = false;
        req.session.email = "";
        res.redirect('/');
    },
    signUp: function (req, res, next) {
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

            // API key :  AIzaSyA2Uh8w2_q63RDbAkyXrL6VauMCVc0_slU
            var datasMaps = "";
            var address = req.body.road + ", " + req.body.postalCode + " " + req.body.city + ", " + req.body.country;
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
                    if (datasMaps.status != "OK") {
                        error.push("L'adresse est introuvable !");
                    }
                    writeClientInBase();
                });
            });

            function writeClientInBase() {
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
                    req.session.email = client.email;
                    res.redirect('/client/profil');

                    console.log(address);
                } else
                    res.render('signUp', {title: 'Tutor-A', form: req.body, error: error});
            }

        });
    },
    profil: function (req, res, next) {
        Client.findOne({'email': req.session.email}, function (err, client) {
            if (client)
                res.render('client/profil', {title: 'Tutor-A', client: client});
        });
    },
    editProfil: function (req, res, next) {
        Client.findOne({'email': req.session.email}, function (err, client) {
            if (req.method == 'POST') {
                res.render('client/editProfil', {title: 'Tutor-A', client: client});
            } else {
                if (client) {
                    if (!isEmpty(req.body.firstName))
                        client.firstName = req.body.firstName;

                    res.redirect('/client/profil');
                }
            }
        });
    }

};

module.exports = Clients;
