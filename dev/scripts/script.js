// User inputs start location and destination (address format)
// confirm origin and destination are both valid locations
// On submit, obtain address value and store in variables
// Convert user values to latitude and longitude using google geocodes
// Store user lat long in an array within an object 
// Get data from city bikes api and for each result, map through that array to return a new array of objects each with the lat and long for each station
// Create a function using google's computeDistanceBetween() function enter user and citybikes latlong objects as arguments which will calculate the distance in km
// Apply the function to both starting location and destination
// sort from shortest distance to longest
// take the results with the shortest distance 
// get directions from starting station to end station with distance matrix API
// push to DOM duration, distance and markers onto the map


const bikeApp = {};
bikeApp.cityBikesUrl = 'http://api.citybik.es/v2/networks';
bikeApp.cityBikesToronto = 'https://tor.publicbikesystem.net/ube/gbfs/v1/';

bikeApp.init = function() {
	bikeApp.getCityBikes();
	bikeApp.map();
};

bikeApp.getCityBikes = function() {
	$.ajax({
		url: bikeApp.cityBikesToronto,
		method: 'GET',
		dataType: 'json'
	})
	.then(function(res) {
		console.log(res.data.en.feeds) // returns an array of objects need url
		// system information, station information url, system pricing plans
		bikeApp.stationInfoUrl = res.data.en.feeds[1].url;
		bikeApp.getStationInfo(bikeApp.stationInfoUrl);
	});
};

bikeApp.getStationInfo = function(url) {
	$.ajax({
		url: url,
		method: 'GET',
		dataType: 'json'
	})
	.then(function(stations) {
		console.log(stations);
	});
}

// this is used to initialize the map 
var initMap = function() {
	new google.maps.Map(document.getElementById('map'), {
	  center: {lat: 43.70011, lng: -79.4163},
	  zoom: 11
	});
}

bikeApp.map = function initMap() {
}




// next ajax request
// get system information, station information url, system pricing plans
// next ajax request
// using station information url - get station data locations

$(function() {
	bikeApp.init();
});

