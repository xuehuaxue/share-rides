var express = require('express');
const Trip = require('../models/trip');
const functions = require('./functions/functions');

var router = express.Router();  // this app is build with express.js

// this controller takes everything associated with trips, including creating trips, editing trips, joining a trip,
// deleting a trip, searching for trips, and all other functions.

router.get('/', function (req, res, next) {
    res.send('hello world');  // a test get request
});

router.post('/new_trip', function (req, res) {  // this api handle the request for creating new trips
    if (!req.user) {  // if user is not log in, do not have to proceed further
        res.render('error', {  // render error page and send the message
            message: "not log in",
            error: {}
        });
    }
    else {
        // if user is log in, then use generate_cords functions to get cords for start and end addresses
        Promise.all([functions.generate_cords(req.body.start), functions.generate_cords(req.body.end)])
            .then(function (allData) {  //use promises.all to find lat and lgn of the trip start and end before storing them
                var start_cords = allData[0] // promise will return results in an array
                var end_cords = allData[1]
                var user = req.user
                var new_trip = new Trip({  // gather all info, lets initialize a new data
                    start_cords: start_cords,  // cords we get earlier
                    end_cords: end_cords,
                    user_id: user._id,  // user_id is used to identify the user's identity
                    host: user.username,
                    host_email: user.email,
                    host_phone: user.phone,
                    start: req.body.start,
                    end: req.body.end,
                    date: req.body.date,
                    space_avaliable: req.body.total_space,  // every trip requires a total space number, user is not included
                    expense: req.body.expense,  // total expense for this trip
                    note: req.body.note,  // if there is any note
                    member: []  // there won't be any member when the trip is created, since user itself is not included
                });
                new_trip.save(function (err) {
                    if (err) {
                        res.send(err);
                    }
                    else {
                        console.log('save successfully!')
                        res.redirect('edit_trips');  // if success, redirect to the same page
                    }
                })
            });
    }
});

router.get('/edit_trips', function (req, res) {  // this api allows registered users to edit trips under his/her account
    if (!req.user) {  // user cannot edit any trip without signing in
        console.log("please log in first");
        res.redirect('back');
    }
    else {
        function get_my_hosts() {
            return new Promise(function (resolve, reject) {
                Trip.find({user_id: req.user._id}, function (err, results) {  // find all trips created by the user
                    if (err) {
                        return reject(err);
                    }
                    else {
                        // res.render('mytrips', {my_trips: results});
                        return resolve(results);  // if no error, resolve 
                    }
                })
            })
        }

        function get_my_joins() {
            return new Promise(function (resolve, reject) {
                Trip.find({member: req.user.username}, function (err, results) {  // find all trips the user is joined to
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

        Promise.all([get_my_hosts(), get_my_joins()]).then(function (allData) {  // since javascript is asychronous, it will concurrently find
            res.render('mytrips', {my_trips: allData[0], my_joins: allData[1]});   // trips created by users and trips the user is joined to
        })                                                                          // then render them to the front end

    }
});

router.post('/edit_trips', function (req, res) {  // this post method process user's request for updating
    const new_info = {  // for simplicity, only these four info are allowed to be alter
        date: req.body.date,  // if start or end is change, new calculation of cordinates is requred
        expense: req.body.expense,  // which will be easier if user just create a new trip
        space_avaliable: req.body.total_space,
        note: req.body.note
    }
    Trip.update({_id: req.body._id}, new_info, {runValidators: true}, function (err, raw) {
        if (err) {  // find the trip with right trip_id and update it. by default, validator is not run
            res.send(err);  // we have to force it to run
        }
        else {
            res.redirect('back');  // when success, just go back to the previous page
        }
    });
});

router.get('/db', function (req, res, next) {  // a helper router to acquired all trips under the database
    Trip.find({}, function (err, results) {
        res.json(results);
    })
});

router.post('/delete/:_id', function (req, res) {  // this api takes trip id in parameters and delete the 
    Trip.remove({_id: req.params._id}, function (err, result) {  // corresponding trip accordingly
        if (err) {
            res.render('error', {
                message: err.message,
                error: {}
            });
        }
        else {
            console.log("success!")
            res.redirect('/index/edit_trips');  // if success, go back
        }
    })
})

router.post('/process_data', function (req, res) {  // this api acts as backend function for ajax function in index.ejs
    Promise.all([functions.generate_cords(req.body.from), functions.generate_cords(req.body.to)])  // ajax triggers this request
        .then(function (allData) {  // and it will first looks through the system to find data with close cords in start and end
            var start_cords = allData[0];  // then send back the data to ajax in json format
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
                    var filter_data = results.filter(function (data) {  // if start and end are 20 miles closed to user's input address
                        return Math.abs(data.start_cords.lat - start_cords.lat) <= 0.362 &&  // and the address is host by other user
                            Math.abs(data.end_cords.lat - end_cords.lat) <= 0.362 && user_id != data.user_id  // return it to the front
                    });
                    res.json(filter_data);
                }
            });
        });
});


// when the user joins the trip
router.post('/join_trip', function (req, res) {  // this api process the request of joining a trip
    // in order to join a trip, following must be met 1)the user was not already a member
    // 2)the trip still has at least one space (which is filter at front end search) 3)the trip cannot be expired
    if (!req.user) {
        res.redirect('/');
    }
    var member = JSON.parse(req.body.member);
    var user_name = req.user.username;
    if (member.includes(user_name)) {  // it makes no sense if an user is joined to a trip twice
        res.status(400).send('user already in the trip!');
    }
    else {
        member.push(user_name);  // otherwise just add the user to the member array
        const new_info = {  // don't worry, member number won't exceed the total space
            member: member  // because if member.length == space_avaliable, the trip will be filtered out 
        }  // before being rendering to the frontend
        Trip.update(  // simply update member array to the trip
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

router.post('/leave_trip/:_id', function (req, res) {  // this api takes care of user's request of leaving a trip

    var member = JSON.parse(req.body.member);
    member.splice(member.indexOf(req.user.username), 1);  // array.splice(n, 1) will remove one element from the array at index n
    console.log(member);  // Array.indeOf(n) will return the index of the element.

    const new_info = {
        member: member
    }

    Trip.update(  // when the user is removed from the member array, we should update the trip model
        {_id: req.params._id},
        new_info,
        function (err, raw) {
            if (err) {
                res.status(400).send(err);
            }
            else {
                console.log('leave successful!');
                res.redirect('back');  // if successed, we should go back
            }
        });
});

module.exports = router;  // export all routes for app.js