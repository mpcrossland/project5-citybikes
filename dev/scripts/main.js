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
		bikeApp.getStationInfo();
	});
};

//ajax call for citybikes
bikeApp.getStationInfo = function() {
	$.ajax({
		url: bikeApp.stationInfoUrl,
		method: 'GET',
		dataType: 'json'
	})
	.then(function(stations) {
		console.log(stations.data.stations);
		bikeApp.cityBikesRefined = stations.data.stations.map((station) => {
			return {
				stations: station,
				latLong: [station.lat, station.lon]
			}
		})
	})
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
	var distanceOriginInfo = [];
	var distanceDestinationInfo = [];

	if (bikeApp.userDestinationLatLong.length > 0 && bikeApp.userOriginLatLong.length > 0) {
		console.log(bikeApp.userOriginLatLong);
		console.log(bikeApp.userDestinationLatLong);
		let originLatLong = new google.maps.LatLng(bikeApp.userOriginLatLong[0], bikeApp.userOriginLatLong[1]);
		bikeApp.destinationLatLong = new google.maps.LatLng(bikeApp.userDestinationLatLong[0], bikeApp.userDestinationLatLong[1]);
		bikeApp.cityBikesRefined.forEach((station) => {
			let cityBikesLatLong = new google.maps.LatLng(station.latLong[0], station.latLong[1]);
			let distanceBetweenOrigin = google.maps.geometry.spherical.computeDistanceBetween(originLatLong, cityBikesLatLong);
			let distanceBetweenDestination = google.maps.geometry.spherical.computeDistanceBetween(bikeApp.destinationLatLong, cityBikesLatLong);
			distanceOriginInfo.push({
				station_id: station.stations.station_id,
				station_name: station.stations.name,
				station_latlong: station.latLong,
				distance_origin: distanceBetweenOrigin,
			});

			distanceDestinationInfo.push({
				station_id: station.stations.station_id,
				station_name: station.stations.name,
				station_latlong: station.latLong,
				distance_dest: distanceBetweenDestination
			});
		});

		let shortestDistanceOrigin = distanceOriginInfo.sort((a, b) => {
			if (a.distance_origin && b.distance_origin) {
				return a.distance_origin - b.distance_origin;
			} else {
				return 999999999999999;
			}
		});

		let shortestDistanceDestination = distanceDestinationInfo.sort((a, b) => {
			if (a.distance_dest && b.distance_dest) {
				return a.distance_dest - b.distance_dest;
			} else {
				return 999999999999999;
			}
		});

		bikeApp.shortestDistanceOriginStation = shortestDistanceOrigin[0];
		bikeApp.shortestDistanceDestinationStation = shortestDistanceDestination[0];
		bikeApp.shortestDistanceOriginLatLong = new google.maps.LatLng(bikeApp.shortestDistanceOriginStation.station_latlong[0], bikeApp.shortestDistanceOriginStation.station_latlong[1]);
		const shortestDistanceDestinationLatLong = new google.maps.LatLng(bikeApp.shortestDistanceDestinationStation.station_latlong[0], bikeApp.shortestDistanceDestinationStation.station_latlong[1]);
		//data to be used if there are no bike stations near user destination point
		bikeApp.distanceBetweenOriginStationAndDestination = google.maps.geometry.spherical.computeDistanceBetween(bikeApp.shortestDistanceOriginLatLong, bikeApp.destinationLatLong);
		bikeApp.distanceBetweenOriginStationAndDestination = (bikeApp.distanceBetweenOriginStationAndDestination / 1000).toFixed(2);
		// need latitude and longitude value for shortest distance station to plug into this function
		bikeApp.getDistanceDuration(bikeApp.shortestDistanceOriginLatLong, shortestDistanceDestinationLatLong);

	}
}
//listens for when user submits info and stores that info to originAddress/destinationAddress/time
bikeApp.getUserInput = function (){
	$('.userInput').on('submit', function(e){
		e.preventDefault();
		const originAddress = $('#origin-input').val()
		const destinationAddress = $('#destination-input').val();
		bikeApp.time = $('#time').val();
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

bikeApp.getDistanceDuration = function(stationOrigin, stationDestination) {
	var distanceService = new google.maps.DistanceMatrixService();
	distanceService.getDistanceMatrix({
	    origins: [stationOrigin],
	    destinations: [stationDestination],
	    travelMode: google.maps.TravelMode.BICYCLING,
	    unitSystem: google.maps.UnitSystem.METRIC,
	    durationInTraffic: true

	},
	function (response, status) {
	    if (status !== google.maps.DistanceMatrixStatus.OK) {
	        console.log('Error:', status);
	    } else {
	    	bikeApp.stationTravelTime = response.rows[0].elements[0].duration.value; //receiving travel time in seconds
	    	bikeApp.getDistanceDurationRoundTrip(bikeApp.shortestDistanceOriginLatLong, bikeApp.destinationLatLong);

	    }
	});
}

bikeApp.getDistanceDurationRoundTrip = function(stationOrigin, userDestination) {
	var distanceService = new google.maps.DistanceMatrixService();
	distanceService.getDistanceMatrix({
	    origins: [stationOrigin],
	    destinations: [userDestination],
	    travelMode: google.maps.TravelMode.BICYCLING,
	    unitSystem: google.maps.UnitSystem.METRIC,
	    durationInTraffic: true

	},
	function (response, status) {
	    if (status !== google.maps.DistanceMatrixStatus.OK) {
	        console.log('Error:', status);
	    } else {
	    	bikeApp.roundTripTravelTime = Math.floor(((response.rows[0].elements[0].duration.value) / 60) * 2); //converting roundtrip travel time to minutes ( * 2 as it is a round trip)
	    	bikeApp.travelTimeDifference(bikeApp.time, bikeApp.stationTravelTime);
	    }
	});
}

bikeApp.travelTimeDifference = function (userTime, distanceDuration) {
	var distanceDurationMinutes = distanceDuration / 60 
	var userTimeMinutes = userTime * 60
	var distanceDifference = userTimeMinutes - distanceDurationMinutes
	console.log(distanceDurationMinutes, "distanceDurationMinutes");
	console.log(userTimeMinutes, "userTimeMinutes");
	console.log(distanceDifference, "distance difference");

	if (distanceDifference < 0) {
		//if user time input is less than trip destination time, prompt alert
		alert(`You have selected ${bikeApp.time} hours for your trip, but it will take you ${ Math.floor(distanceDurationMinutes) } minutes to get to your destination. Please adjust your trip time`);
	} else {
		bikeApp.displayResults(distanceDurationMinutes, bikeApp.roundTripTravelTime); 
	}
}	


bikeApp.displayResults = function (stationDistance, roundTripTravelTime) {
	const originDistanceKm = (bikeApp.shortestDistanceOriginStation.distance_origin / 1000).toFixed(2);
	const destinationDistanceKm = (bikeApp.shortestDistanceDestinationStation.distance_dest / 1000).toFixed(2);
	const originPoint = $("<p>").text(`Station closest to your origin: ${bikeApp.shortestDistanceOriginStation.station_name}, ${originDistanceKm}km away`);
	const destinationPoint = $("<p>").text(`Station closest to your destination: ${bikeApp.shortestDistanceDestinationStation.station_name}, ${destinationDistanceKm}km away`);
	const travelTime = $("<p>").text(`It will take you ${ Math.floor(stationDistance) } minutes to cycle from ${bikeApp.shortestDistanceOriginStation.station_name} to ${bikeApp.shortestDistanceDestinationStation.station_name}`)
	$('.trip-info').empty();
	if (destinationDistanceKm > 2) {
	const noDestinationStation = $("<p>").text(`There are no stations near your destination point.`);
	const originStationRoundTrip = $("<p>").text(`It will take you ${bikeApp.roundTripTravelTime} minutes to get to your destination and back`) 
	$(".trip-info").append(originPoint, noDestinationStation, originStationRoundTrip);
	    	console.log(bikeApp.roundTripTravelTime, "it's round trip stuff hurray don't be undefined");
	}
	else 
	$(".trip-info").append(originPoint, destinationPoint, travelTime);

}





$(function() {
	bikeApp.init();
});

