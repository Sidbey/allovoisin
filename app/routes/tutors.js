var express = require('express');
var router = express.Router();
var offer = require('../controllers/Offers');

function isTutor(req, res, next) {
    if (req.session.isAuthenticated === true)
        if (req.session.isTutor === true)
            next();
        else
            res.redirect('/?error=notTutor');
    else
        res.redirect('/?error=notLogged');
}

router.get('/dashboard', isTutor, offer.tutorDashboard);
router.get('/new-offer', isTutor, offer.newOffer);
router.post('/new-offer', isTutor, offer.newOffer);


module.exports = router;
