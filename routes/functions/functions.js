var googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyDuml18e99sTfQh_CoVryqIBFhPMJGWEwE'
});

function generate_cords(input_address, callback) { // function used to generate longitude and latitude
    googleMapsClient.geocode({
        address: input_address
    }, function (err, response) {
        if (!err) {
            callback(null, response.json.results[0].geometry.location) // fetch long and lat
        }
        else {
            console.log('get error');
            callback(error, null);
        }
    });
}

module.exports = {generate_cords:generate_cords};