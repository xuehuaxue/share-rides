var express = require('express');
const Trip = require('../models/trip');
const functions = require('./functions/functions');

var router = express.Router();

router.get('/', function (req, res, next) {
    res.send('hello world');
});

router.post('/new_trip', function (req, res) {
    if (!req.user) {
        res.render('error', {
            message: "not log in",
            error: {}
        });
    }
    else {
        functions.generate_cords(req.body.start, function (error, response) {
            if (error) {
                res.send(error);
            }
            else {
                var start_cords = response
                functions.generate_cords(req.body.end, function (error, response) {
                    if (error) {
                        res.send(error);
                    }
                    else {
                        var end_cords = response
                        var user = req.user
                        var new_trip = new Trip({
                            start_cords: start_cords,
                            end_cords: end_cords,
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
                        });
                        new_trip.save(function (err) {
                            if (err) {
                                res.send(err);
                            }
                            else {
                                res.redirect('edit_trips');
                            }
                        })
                    }
                })
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
    const new_info = {
        date: req.body.date,
        expense: req.body.expense,
        space_avaliable: req.body.total_space,
        note: req.body.note
    }
    Trip.update({_id: req.body._id}, new_info, function (err, raw) {
        if (err) {
            res.send(err);
        }
        res.redirect('/index/edit_trips');
    });
});

router.get('/db', function (req, res, next) {
    Trip.find({}, function (err, results) {
        res.json(results);
    })
});

// not fninsh yet
router.post('/delete/:_id', function (req, res) {
    Trip.remove({_id: req.params._id}, function (err, result) {
        if (err) {
            res.render('error', {
                message: err.message,
                error: {}
            });
        }
        else {
            console.log("success!")
            res.redirect('/index/edit_trips');
        }
    })
})

router.post('/process_data', function (req, res) {
    functions.generate_cords(req.body.from, function (error, response) {
        if (error) {
            res.send(error);
        }
        else {
            var start_cords = response;
            functions.generate_cords(req.body.to, function (error, response) {
                if (error) {
                    res.send(error);
                }
                else {
                    var end_cords = response;
                    console.log([start_cords, end_cords]);
                    //[ { lat: 42.3355488, lng: -71.16849450000001 },
                    //{ lat: 42.3398067, lng: -71.0891717 } ]
                    Trip.find({}, function (err, results) {
                        if (err) {
                            res.send(err);
                        }
                        else {
                            // 1 degress is approximately 55.2428 miles, then 20 degrees =~ 0.362
                            var filter_data = results.filter(function (data) {
                                return Math.abs(data.start_cords.lat - start_cords.lat) <= 0.362 &&
                                    Math.abs(data.end_cords.lat - end_cords.lat) <= 0.362 && req.user._id != data.user_id
                            });
                            console.log(filter_data);
                            res.json(filter_data);
                        }
                    })
                }
            });
        }
    });
});


module.exports = router;