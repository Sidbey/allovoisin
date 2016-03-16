var express = require('express');
var router = express.Router();
var client = require('../controllers/Clients');
var offer = require('../controllers/Offers');

function isAlreadyConnected(req, res, next) {
    console.log('isAuth = ' + req.session.isAuthenticated);
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
    res.render('signIn', {title: 'Tutor-A', form: {}});
});
router.post('/sign-in', isAlreadyConnected, client.signIn);
// GET disconnect page
router.get('/sign-out', client.signOut);
// GET/POST inscription page
router.get('/sign-up', isAlreadyConnected, function (req, res, next) {
    res.render('signUp', {title: 'Tutor-A', form: {}})
});
router.post('/sign-up', isAlreadyConnected, client.signUp);

router.get('/offers', offer.index);
router.get('/offer/:id', offer.selectOffer);
router.post('/offer/:id', isClient, offer.selectOffer);

router.get('/tuteurs', function (req, res, next) {
    res.render('tuteurs', {title: 'Tutor-A'});
});

module.exports = router;
