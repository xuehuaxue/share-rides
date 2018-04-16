var express = require('express');
const Trip = require('../models/trip');
var googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyDuml18e99sTfQh_CoVryqIBFhPMJGWEwE'
});

var router = express.Router();

router.get('/', function (req, res, next) {
    res.send('hello world')
});

router.post('/new_trip', function (req, res) {
    if (!req.user) {
        console.log('not log in')
    }
    else {
        var user = req.user
        var new_trip = new Trip({
            user_id: user._id,
            host: user.username,
            host_email: user.email,
            host_phone: user.phone,
            start: req.body.start,
            end: req.body.end,
            date: req.body.date,
            space_avaliable: req.body.total_space,
            expense: req.body.expense,
            note: req.body.note,
            member: []
        })
        new_trip.save(function (err) {
            if (err) {
                res.send(err);
            }
            else {
                res.redirect('edit_trips');
            }
        })
    }
});

router.get('/edit_trips', function (req, res) {
    if (!req.user) {
        console.log("please log in first");
        res.redirect('/');
    }
    else {
        Trip.find({user_id: req.user._id}, function (err, results) {
            if (err) {
                res.send(err);
            }
            else {
                res.render('mytrips', {my_trips: results});
            }
        })
    }
});

router.post('/edit_trips', function (req, res) {
    res.send(req.body);
})

router.get('/db', function (req, res, next) {
    Trip.find({}, function (err, results) {
        res.json(results);
    })
});

// not fninsh yet
router.delete('index/delete/:_id', function (req, res, next) {
    Trip.remove(req.params._id, function (err, result) {
        if (err) {
            res.json({message: 'Error deleting'});
        }
        else {
            res.json({message: 'success'});
        }
    })
})

module.exports = router;