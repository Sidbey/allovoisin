var express = require('express');
var router = express.Router();
var client = require('../controllers/Clients');

router.use(function (req, res, next) {
    if (req.session.isAuthenticated === undefined || req.session.isAuthenticated === false) {
        res.redirect('/?error=notLogged');
    } else {
        next();
    }
});

router.get('/profil', client.profil);
router.get('/edit-profil', client.editProfil);
router.post('/edit-profil', client.editProfil);
router.post('/tutor-upgrade', client.tutorUpgrade);

module.exports = router;
