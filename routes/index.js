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
        Promise.all([functions.generate_cords(req.body.start), functions.generate_cords(req.body.end)])
            .then(function (allData) {  //use promises.all to find lat and lgn of the trip start and end before storing them
                var start_cords = allData[0]
                var end_cords = allData[1]
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
                        console.log('save successfully!')
                        res.redirect('edit_trips');
                    }
                })
            });
    }
});

router.get('/edit_trips', function (req, res) {
    if (!req.user) {
        console.log("please log in first");
        res.redirect('back');
    }
    else {
        function get_my_hosts() {
            return new Promise(function (resolve, reject) {
                Trip.find({user_id: req.user._id}, function (err, results) {
                    if (err) {
                        return reject(err);
                    }
                    else {
                        // res.render('mytrips', {my_trips: results});
                        return resolve(results);
                    }
                })
            })
        }

        function get_my_joins() {
            return new Promise(function (resolve, reject) {
                Trip.find({member: req.user.username}, function (err, results) {
                    if (err) {
                        console.log('get error!');
                        return reject(err);
                    }
                    else {
                        return resolve(results);
                    }
                })
            })
        }

        Promise.all([get_my_hosts(), get_my_joins()]).then(function (allData) {
            res.render('mytrips', {my_trips: allData[0], my_joins: allData[1]});
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
    Trip.update({_id: req.body._id}, new_info, {runValidators: true}, function (err, raw) {
        if (err) {
            res.send(err);
        }
        else {
            res.redirect('back');
        }
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
    Promise.all([functions.generate_cords(req.body.from), functions.generate_cords(req.body.to)])
        .then(function (allData) {
            var start_cords = allData[0];
            var end_cords = allData[1];
            Trip.find({}, function (err, results) {
                if (err) {
                    res.send(err);
                }
                else {
                    // 1 degress is approximately 55.2428 miles, then 20 degrees =~ 0.362
                    var user_id = '';
                    if (req.user) {
                        user_id = req.user._id;
                    }
                    var filter_data = results.filter(function (data) {
                        return Math.abs(data.start_cords.lat - start_cords.lat) <= 0.362 &&
                            Math.abs(data.end_cords.lat - end_cords.lat) <= 0.362 && user_id != data.user_id
                    });
                    console.log(filter_data);
                    res.json(filter_data);
                }
            });
        });
});


// when the user joins the trip
router.post('/join_trip', function (req, res) {
    // in order to join a trip, following must be met 1)the user was not already a member
    // 2)the trip still has at least one space (which is filter at front end search) 3)the trip cannot be expired
    if (!req.user) {
        res.redirect('/');
    }
    var member = JSON.parse(req.body.member);
    var user_name = req.user.username;
    if (member.includes(user_name)) {
        res.status(400).send('user already in the trip!');
    }
    else {
        member.push(user_name);
        const new_info = {
            member: member
        }
        Trip.update(
            {_id: req.body.trip_id},
            new_info,
            function (err, raw) {
                if (err) {
                    res.status(400).send(err);
                }
                else {
                    console.log('join successful!');
                }
            });
    }
});

router.post('/leave_trip/:_id', function (req, res) {

    var member = JSON.parse(req.body.member);
    member.splice(member.indexOf(req.user.username), 1);
    console.log(member);

    const new_info = {
        member: member
    }

    Trip.update(
        {_id: req.params._id},
        new_info,
        function (err, raw) {
            if (err) {
                res.status(400).send(err);
            }
            else {
                console.log('leave successful!');
                res.redirect('back');
            }
        });
});

module.exports = router;