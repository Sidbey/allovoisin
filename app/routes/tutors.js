var express = require('express');
var router = express.Router();
var tutor = require('../controllers/Tutors');
var offer = require('../controllers/Offers');

function isTutor(req, res, next) {
    if (req.session.isAuthenticated === true)
        if (req.session.isTutor === true)
            next();
        else
            return res.redirect('/?error=notTutor');
    else
        return res.redirect('/?error=notLogged');
}

router.get('/dashboard', isTutor, tutor.dashboard);
router.get('/new-offer', isTutor, offer.newOffer);
router.post('/new-offer', isTutor, offer.newOffer);
router.get('/offer-requests', isTutor, tutor.offerRequest);
router.post('/offer-requests', isTutor, tutor.offerRequestDecision);

router.get('/:id', tutor.publicProfil);


module.exports = router;
