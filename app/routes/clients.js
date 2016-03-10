var express = require('express');
var router = express.Router();

router.use(function (req, res, next) {
   if (req.session.isAuthenticated === undefined || req.session.isAuthenticated === false) {
       res.redirect('/?error=notLogged');
   }  else {
       next();
   }
});

/* GET clients listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

module.exports = router;
