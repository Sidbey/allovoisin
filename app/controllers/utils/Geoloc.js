const axios = require('axios');

const checkIfResult = response => {
    if (response.data.status != "OK")
        throw Error('L\'adresse est introuvable !');
    return response
};

var extractFirstResult = response => response.data.results[0];

const checkHasStreetNumber = result => {
    if (result.address_components[0].types[0] != 'street_number')
        throw Error('L\'adresse est incomplète !');
    return result
};
const extractAddressData = result => {
    const addressComponents = result.address_components;
    const location = result.geometry.location;
    return {
        road: addressComponents[0].long_name + " " + addressComponents[1].long_name,
        postalCode: addressComponents[6].long_name,
        city: addressComponents[2].long_name,
        country: addressComponents[5].long_name,
        latitude: location.lat,
        longitude: location.lng
    }
};
const Geoloc = {
    getLocalisationData: (address) => axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: address.replace(/\s/g, '+'),
                key: 'AIzaSyA2Uh8w2_q63RDbAkyXrL6VauMCVc0_slU'
            }
        })
        .then(checkIfResult)
        .then(extractFirstResult)
        .then(checkHasStreetNumber)
        .then(extractAddressData)
};

module.exports = Geoloc;