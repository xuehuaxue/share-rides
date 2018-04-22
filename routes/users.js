// thank https://github.com/saintedlama/passport-local-mongoose for tutorials in the users part
var express = require('express');
var router = express.Router();
const User = require('../models/user');
const passport = require('passport');

/* set up passport for mongoose */
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* GET home page. */
router.get('/', function (req, res, next) {
    // User.remove(function() {}); //clear all data, used as a helper
    res.render('index', {my_trips: null});
});

router.post('/register', function (req, res, next) {
    console.log(req.body.birthday, req.body.phone, req.body.email);
    User.register(new User({
        username: req.body.username,
        phone: req.body.phone,
        email: req.body.email
    }), req.body.password, function (err) {
        if (err) {
            console.log('error while user register!', err);
            return next(err);
        }
        console.log('user registered!');
        res.redirect('/');
    });
});

router.post('/login', passport.authenticate('local'), function (req, res) {
    res.redirect('/');
});

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

// helper function to show everything under the database
router.get('/db', function (req, res, next) {
    User.find({}, function (err, results) {
        res.json(results);
    })
})

module.exports = router;
