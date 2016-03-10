var express = require('express');
var router = express.Router();
var client = require('../controllers/Clients');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Tutor-A'});
});
router.get('/sign-in', function(req, res, next) {
    res.render('signIn', {title: 'Tutor-A', form: {email: ""}});
});
router.post('/sign-in', client.signIn);
router.get('/sign-up', function(req, res, next) {
   res.render('signUp', {title: 'Tutor-A', form: {firsName: "", lastName: "", email: "", age: "", road: "", postalCode: "", city: "", country: ""}})
});
router.post('/sign-up', client.signUp);

module.exports = router;
