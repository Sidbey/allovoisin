var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.get('/connexion', function (req, res, next) {
    res.render('connexion', {title: 'Express'});
});

router.get('/liste_offre', function (req, res, next) {
    res.render('liste_offre', {title: 'Express'});
});

router.get('/proposition_offre', function (req, res, next) {
    res.render('proposition_offre', {title: 'Express'});
});

router.get('/profil', function (req, res, next) {
    res.render('profil', {title: 'Express'});
});


module.exports = router;
