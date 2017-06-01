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
bikeApp.userOriginLatLong =[];
bikeApp.userDestinationLatLong =[];

bikeApp.init = function() {
	bikeApp.getCityBikes();
	bikeApp.map();
	bikeApp.userTime();
	bikeApp.getLocations();
	bikeApp.getUserInput();
};


// allows for a live value change on the time slider.
const outputUpdate = function(time) {
	document.querySelector('#hours').value = time;
}
bikeApp.userTime = function outputUpdate() {
}

//ajax call to citybikes 
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

//ajax call for citybikes
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

//auto completes location using geocode and stores it to userOrigin/Destination
bikeApp.getLocations = function(){
	 var userOrigin = new google.maps.places.Autocomplete(
	 		(document.getElementById('origin-input')),
      {types: ['geocode']});
	 var userDesination = new google.maps.places.Autocomplete(
	 		(document.getElementById('destination-input')),
      {types: ['geocode']});
}

// setting callback functions for user lat long values
bikeApp.setUserOriginLatLong = function(result) {
	bikeApp.userOriginLatLong = [ 
    	result.geometry.location.lat(), 
    	result.geometry.location.lng()]
    	// console.log(userOriginLatLong);
    bikeApp.compareDistances();
}
bikeApp.setUserDestinationLatLong = function(result) {
    bikeApp.userDestinationLatLong = [ 
    	result.geometry.location.lat(), 
    	result.geometry.location.lng()]
    bikeApp.compareDistances();
}

// compare distances with city bikes api and user lat long
bikeApp.compareDistances = function() {
	if (bikeApp.userDestinationLatLong.length > 0 && bikeApp.userOriginLatLong.length > 0) {
		console.log(bikeApp.userOriginLatLong);
		console.log(bikeApp.userDestinationLatLong);
	}
}
//listens for when user submits info and stores that info to originAddress/destinationAddress/time
bikeApp.getUserInput = function (){
	$('.userInput').on('submit', function(e){
		e.preventDefault();
		const originAddress = $('#origin-input').val()
		const destinationAddress = $('#destination-input').val();
		const time = $('#time').val();

		bikeApp.getUserLatLong(bikeApp.setUserOriginLatLong, originAddress);
		bikeApp.getUserLatLong(bikeApp.setUserDestinationLatLong, destinationAddress);
	})
}

//turns the location in to lat/lon values

bikeApp.getUserLatLong = function (callback, address){
	geocoder = new google.maps.Geocoder();
	if (geocoder){
		geocoder.geocode({
			'address':address
		}, function (results, status){
			if (status == google.maps.GeocoderStatus.OK){
				callback(results[0]);
			}
		});
	}
}



$(function() {
	bikeApp.init();
});

