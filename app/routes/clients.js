var express = require('express');
var router = express.Router();
var client = require('../controllers/Clients');

function isClient(req, res, next) {
    if (req.session.isAuthenticated === true)
        next();
    else
        return res.redirect('/?error=notLogged');
}

router.get('/profil', isClient, client.profil);
router.get('/edit-profil', isClient, client.editProfil);
router.post('/edit-profil', isClient, client.editProfil);
router.get('/edit-password', isClient, client.editPassword);
router.post('/edit-password', isClient, client.editPassword);
router.get('/tutor-upgrade', isClient, client.tutorUpgrade);
router.get('/offer-requests', isClient, client.offerRequest);

module.exports = router;
