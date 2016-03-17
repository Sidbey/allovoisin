var express = require('express');
var router = express.Router();
var client = require('../controllers/Clients');

// GET home page
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Tutor-A'});
});
// GET/POST connection page
router.get('/sign-in', function(req, res, next) {
    res.render('signIn', {title: 'Tutor-A', form: {email: ""}});
});
router.post('/sign-in', client.signIn);
// GET disconnect page
router.get('/sign-out', client.signOut);
// GET/POST inscription page
router.get('/sign-up', function(req, res, next) {
   res.render('signUp', {title: 'Tutor-A', form: {firsName: "", lastName: "", email: "", age: "", road: "", postalCode: "", city: "", country: ""}})
});
router.post('/sign-up', client.signUp);
router.get('/signUpStudent', function (req, res, next) {
    res.render('signUpStudent', {title: 'Tutor-A'});
});

router.get('/signUpTutors', function (req, res, next) {
    res.render('signUpTutors', {title: 'Tutor-A'});
});

router.get('/tuteurs', function (req, res, next) {
    res.render('tuteurs', {title: 'Tutor-A'});
});

router.get('/new-offer', function (req, res, next) {
    res.render('new-offer', {title: 'Tutor-A'});
});

module.exports = router;
