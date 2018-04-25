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

// this controller handles user's use cases, including register accounts, login, and others.
router.post('/register', function (req, res, next) {  // the app use passport-local-strategy for user authorization and authentication
    console.log(req.body.birthday, req.body.phone, req.body.email);  // which is a library pack designed to make local sign up and login
    User.register(new User({  // extremely simple. Here I am creating a new User schema
        username: req.body.username,
        phone: req.body.phone,
        email: req.body.email
    }), req.body.password, function (err) {  // error exists when username is duplicate
        if (err) {
            console.log('error while user register!', err);
            return next(err);
        }
        console.log('user registered!');  // if not error, the account is registered!
        res.redirect('/');
    });
});

router.post('/login', passport.authenticate('local'), function (req, res) {
    res.redirect('/');
});

router.get('/logout', function (req, res) {
    req.logout();  // login routes
    res.redirect('/');
});

// helper function to show all user accounts under the database
router.get('/db', function (req, res, next) {
    User.find({}, function (err, results) {
        res.json(results);
    })
})

module.exports = router;
