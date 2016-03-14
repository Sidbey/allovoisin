var express = require('express');
var router = express.Router();
var client = require('../controllers/Clients');
var offer = require('../controllers/Offers');

// GET home page
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Tutor-A', sess: req.session, csrf: req.csrfToken()});
});
// GET/POST connection page
router.get('/sign-in', function (req, res, next) {
    if (req.session.isAuthenticated) {
        res.redirect('/?error=alreadyConnected');
        return;
    }
    res.render('signIn', {title: 'Tutor-A', form: {email: ""}, sess: req.session});
});
router.post('/sign-in', client.signIn);
// GET disconnect page
router.get('/sign-out', client.signOut);
// GET/POST inscription page
router.get('/sign-up', function (req, res, next) {
    if (req.session.isAuthenticated) {
        res.redirect('/?error=alreadyConnected');
        return;
    }
    res.render('signUp', {
        title: 'Tutor-A', form: {
            firsName: "", lastName: "", email: "", age: "",
            road: "", postalCode: "", city: "", country: ""
        }, sess: req.session
    })
});
router.post('/sign-up', client.signUp);

router.get('/offers', offer.index);

router.get('/tuteurs', function (req, res, next) {
    res.render('tuteurs', {title: 'Tutor-A', sess: req.session});
});

module.exports = router;
