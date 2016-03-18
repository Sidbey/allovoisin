var express = require('express');
var router = express.Router();
var client = require('../controllers/Clients');
var offer = require('../controllers/Offers');

function isAlreadyConnected(req, res, next) {
    if (req.session.isAuthenticated === true)
        return res.redirect('/?error=alreadyConnected');
    else
        next();
}
function isClient(req, res, next) {
    if (req.session.isAuthenticated === true)
        next();
    else
        return res.redirect('/?error=notLogged');
}

// GET home page
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Tutor-A'});
});
// GET/POST connection page
router.get('/sign-in', isAlreadyConnected, function (req, res, next) {
    res.render('signIn', {title: 'Tutor-A - Se connecter', form: {}});
});
router.post('/sign-in', isAlreadyConnected, client.signIn);
// GET disconnect page
router.get('/sign-out', client.signOut);
// GET/POST inscription page
router.get('/sign-up', isAlreadyConnected, function (req, res, next) {
    res.render('signUp', {title: 'Tutor-A - S\'incrire', form: {}})
});
router.get('/sign-up-student', isAlreadyConnected, function (req, res, next) {
    res.render('signUpStudent', {title: 'Tutor-A - Inscription Etudiant', form: {}})
});
router.get('/sign-up-tutor', isAlreadyConnected, function (req, res, next) {
    res.render('signUpTutor', {title: 'Tutor-A - Inscription Tuteur', form: {}})
});
router.post('/sign-up-student', isAlreadyConnected, client.signUp);
router.post('/sign-up-tutor', isAlreadyConnected, client.signUp);

router.get('/offers', offer.index);
router.get('/offer/:id', offer.selectOffer);
router.post('/offer/:id', isClient, offer.selectOffer);

module.exports = router;
