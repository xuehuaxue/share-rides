var googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyDuml18e99sTfQh_CoVryqIBFhPMJGWEwE'
});

// originally, I am using callback to compute cordinates for start and end in sequential order, which
// is not efficient. I have adapted promise in below.
// function generate_cords(input_address, callback) { // function used to generate longitude and latitude
//     googleMapsClient.geocode({
//         address: input_address
//     }, function (err, response) {
//         if (!err) {
//             callback(null, response.json.results[0].geometry.location) // fetch long and lat
//         }
//         else {
//             console.log('get error');
//             callback(error, null);
//         }
//     });
// }

function generate_cords(input_address) { // function used to generate longitude and latitude
    return new Promise(function (resolve, reject) {
        googleMapsClient.geocode({
            address: input_address
        }, function (err, response) {
            if (!err) {
                return resolve(response.json.results[0].geometry.location); // fetch long and lat
            }
            else {
                return reject('error!');
            }
        });
    });
}


module.exports = {generate_cords: generate_cords};