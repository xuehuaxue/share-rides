var express = require('express');
var googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyDuml18e99sTfQh_CoVryqIBFhPMJGWEwE'
});

var router = express.Router();

router.get('/', function (req, res, next) {
    res.send('modify profile');
});

router.post('/draw_routes', function (req, res) {
    console.log(req.body.departure, req.body.destination);
    googleMapsClient.snapToRoads()
});


module.exports = router;