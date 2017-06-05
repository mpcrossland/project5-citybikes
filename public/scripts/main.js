'use strict';

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

//declaring global bikeApp variable
var bikeApp = {};
//City bikes API call URL
bikeApp.cityBikesUrl = 'http://api.citybik.es/v2/networks';
//City bikes API call for Toronto stations
bikeApp.cityBikesToronto = 'https://tor.publicbikesystem.net/ube/gbfs/v1/';
//empty array to store user origin latitude/longitude
bikeApp.userOriginLatLong = [];
//empty array to store user destination latutde/longitude
bikeApp.userDestinationLatLong = [];

//initialize function
bikeApp.init = function () {
	bikeApp.getCityBikes();
	bikeApp.userTime();
	bikeApp.getLocations();
	bikeApp.getUserInput();
};

// allows for a live value change on the time slider.
var outputUpdate = function outputUpdate(time) {
	document.querySelector('#hours').value = time;
};
bikeApp.userTime = function outputUpdate() {}; // try to refactor this by putting the outputUpdate function inside here

//ajax call to citybikes for URLs (for subsequent API calls) 
bikeApp.getCityBikes = function () {
	$.ajax({
		url: bikeApp.cityBikesToronto,
		method: 'GET',
		dataType: 'json'
	}).then(function (res) {
		// returns an array of objects need url
		// system information, station information url, system pricing plans
		bikeApp.stationInfoUrl = res.data.en.feeds[1].url;
		bikeApp.pricingUrl = res.data.en.feeds[3].url;
		bikeApp.getStationInfo();
		// implement station info url for number of bikes available etc.
	});
};

//ajax call for citybikes station info
bikeApp.getStationInfo = function () {
	$.ajax({
		url: bikeApp.stationInfoUrl,
		method: 'GET',
		dataType: 'json'
	}).then(function (stations) {
		bikeApp.cityBikesRefined = stations.data.stations.map(function (station) {
			return {
				stations: station,
				latLong: [station.lat, station.lon]
			};
		});
	});
};

//create a geolocation function that will store user's geolocation if they allow browser to read their current location

//auto completes location using geocode and stores it to userOrigin/Destination
bikeApp.getLocations = function () {
	var userOrigin = new google.maps.places.Autocomplete(document.getElementById('origin-input'), { types: ['geocode'] });
	var userDesination = new google.maps.places.Autocomplete(document.getElementById('destination-input'), { types: ['geocode'] });
};

// setting callback functions for user  origin lat long values
bikeApp.setUserOriginLatLong = function (result) {
	bikeApp.userOriginLatLong = [result.geometry.location.lat(), result.geometry.location.lng()];
	bikeApp.compareDistances();
};
// setting callback functions for user  destination lat long values
bikeApp.setUserDestinationLatLong = function (result) {
	bikeApp.userDestinationLatLong = [result.geometry.location.lat(), result.geometry.location.lng()];
	bikeApp.compareDistances();
};

// compare distances with city bikes api and user lat long
bikeApp.compareDistances = function () {
	var distanceOriginInfo = [];
	var distanceDestinationInfo = [];

	if (bikeApp.userDestinationLatLong.length > 0 && bikeApp.userOriginLatLong.length > 0) {
		var originLatLong = new google.maps.LatLng(bikeApp.userOriginLatLong[0], bikeApp.userOriginLatLong[1]);
		bikeApp.destinationLatLong = new google.maps.LatLng(bikeApp.userDestinationLatLong[0], bikeApp.userDestinationLatLong[1]);
		bikeApp.cityBikesRefined.forEach(function (station) {
			var cityBikesLatLong = new google.maps.LatLng(station.latLong[0], station.latLong[1]);
			var distanceBetweenOrigin = google.maps.geometry.spherical.computeDistanceBetween(originLatLong, cityBikesLatLong);
			var distanceBetweenDestination = google.maps.geometry.spherical.computeDistanceBetween(bikeApp.destinationLatLong, cityBikesLatLong);
			//storing city bikes info for nearest origin station to "distanceOriginInfo" arrray
			distanceOriginInfo.push({
				station_id: station.stations.station_id,
				station_name: station.stations.name,
				station_latlong: station.latLong,
				distance_origin: distanceBetweenOrigin
			});
			//storing city bikes info for nearest destination station to "distanceDestinationInfo" arrray
			distanceDestinationInfo.push({
				station_id: station.stations.station_id,
				station_name: station.stations.name,
				station_latlong: station.latLong,
				distance_dest: distanceBetweenDestination
			});
		});

		var shortestDistanceOrigin = distanceOriginInfo.sort(function (a, b) {
			if (a.distance_origin && b.distance_origin) {
				return a.distance_origin - b.distance_origin;
			} else {
				return 999999999999999;
			}
		});

		var shortestDistanceDestination = distanceDestinationInfo.sort(function (a, b) {
			if (a.distance_dest && b.distance_dest) {
				return a.distance_dest - b.distance_dest;
			} else {
				return 999999999999999;
			}
		});

		// getting the stations with the shortest distance from both the origin and destination
		bikeApp.shortestDistanceOriginStation = shortestDistanceOrigin[0];
		bikeApp.shortestDistanceDestinationStation = shortestDistanceDestination[0];
		bikeApp.shortestDistanceOriginLatLong = new google.maps.LatLng(bikeApp.shortestDistanceOriginStation.station_latlong[0], bikeApp.shortestDistanceOriginStation.station_latlong[1]);
		bikeApp.shortestDistanceDestinationLatLong = new google.maps.LatLng(bikeApp.shortestDistanceDestinationStation.station_latlong[0], bikeApp.shortestDistanceDestinationStation.station_latlong[1]);
		//data to be used if there are no bike stations near user destination point
		bikeApp.distanceBetweenOriginStationAndDestination = google.maps.geometry.spherical.computeDistanceBetween(bikeApp.shortestDistanceOriginLatLong, bikeApp.destinationLatLong);
		bikeApp.distanceBetweenOriginStationAndDestination = (bikeApp.distanceBetweenOriginStationAndDestination / 1000).toFixed(2);
		// need latitude and longitude value for shortest distance station to plug into this function
		bikeApp.getDistanceDuration(bikeApp.shortestDistanceOriginLatLong, bikeApp.shortestDistanceDestinationLatLong);
	}
};

//ajax call for pricing information


//listens for when user submits info and stores that info to originAddress/destinationAddress/time
bikeApp.getUserInput = function () {
	$('.userInput').on('submit', function (e) {
		e.preventDefault();
		//storing user-entered origin address
		var originAddress = $('#origin-input').val();
		//storing user-entered destination address
		var destinationAddress = $('#destination-input').val();
		//storing user entered hourly rental time
		bikeApp.time = $('#time').val();
		//obtaining user origin lat/long (geocoder)
		bikeApp.getUserLatLong(bikeApp.setUserOriginLatLong, originAddress);
		//obtaining user destination lat/long (geocoder)
		bikeApp.getUserLatLong(bikeApp.setUserDestinationLatLong, destinationAddress);
		//"user input" screen hides on "submit"
		$(".userInput").toggleClass("hidden fadeOutUp");
		//show user result/map screen
		$(".user-result").show();
		//initialize map 
		initMap();
	});
};

//turns the location in to lat/lon values
bikeApp.getUserLatLong = function (callback, address) {
	var geocoder = new google.maps.Geocoder();
	if (geocoder) {
		geocoder.geocode({
			'address': address
		}, function (results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				callback(results[0]);
			}
		});
	}
};

//use Google distance matrix service to calculate cycling travel time
bikeApp.getDistanceDuration = function (stationOrigin, stationDestination) {
	var distanceService = new google.maps.DistanceMatrixService();
	distanceService.getDistanceMatrix({
		origins: [stationOrigin],
		destinations: [stationDestination],
		travelMode: google.maps.TravelMode.BICYCLING,
		unitSystem: google.maps.UnitSystem.METRIC,
		durationInTraffic: true
	}, function (response, status) {
		if (status !== google.maps.DistanceMatrixStatus.OK) {
			console.log('Error:', status);
		} else {
			bikeApp.stationTravelTime = response.rows[0].elements[0].duration.value; //receiving travel time in seconds
			bikeApp.getDistanceDurationRoundTrip(bikeApp.shortestDistanceOriginLatLong, bikeApp.destinationLatLong);
		}
	});
};
//seperae distance matric service to calculate roundtrip if no destination station available
bikeApp.getDistanceDurationRoundTrip = function (stationOrigin, userDestination) {
	var distanceService = new google.maps.DistanceMatrixService();
	distanceService.getDistanceMatrix({
		origins: [stationOrigin],
		destinations: [userDestination],
		travelMode: google.maps.TravelMode.BICYCLING,
		unitSystem: google.maps.UnitSystem.METRIC,
		durationInTraffic: true

	}, function (response, status) {
		if (status !== google.maps.DistanceMatrixStatus.OK) {
			console.log('Error:', status);
		} else {
			var roundTripTravelTime = Math.floor(response.rows[0].elements[0].duration.value / 60 * 2); //converting roundtrip travel time to minutes ( * 2 as it is a round trip)
			bikeApp.travelTimeDifference(bikeApp.time, bikeApp.stationTravelTime, roundTripTravelTime);
		}
	});
};

bikeApp.travelTimeDifference = function (userTime, distanceDuration, roundTripTime) {
	var distanceDurationMinutes = distanceDuration / 60; //convert seconds to minutes
	var userTimeMinutes = userTime * 60; //convert user hourly time to minutes
	var distanceDifference = userTimeMinutes - distanceDurationMinutes; //determine user time deducted by distance time to ensure they have selected enough time
	var distanceDifferenceRoundTrip = userTimeMinutes - roundTripTime; //determine user time deducted by round trip time

	if (distanceDifference < 0) {
		//if user time input is less than trip destination time, prompt alert
		alert('You have selected ' + bikeApp.time + ' hour(s) for your trip, but it will take you ' + Math.floor(distanceDurationMinutes) + ' minutes to get to your destination. Please adjust your trip time. \uD83D\uDEB2');
	} else if (distanceDifferenceRoundTrip < 0) {
		//if user time input is less than roundtrip time, prompt alert
		alert('You have selected ' + bikeApp.time + ' hour(s) for your trip, but there are no stations nearby your destination and it will take you ' + Math.floor(roundTripTime) + ' minutes for the round trip. Please adjust your travel time. \uD83D\uDEB2');
		window.location.reload();
	} else {
		bikeApp.getCityBikesPricing(bikeApp.time, distanceDurationMinutes, roundTripTime);
	}
};
//obtain price for trip
bikeApp.getCityBikesPricing = function (userTime, distanceDurationMinutes, roundTripTime) {
	$.ajax({
		url: bikeApp.pricingUrl,
		method: 'GET',
		dataType: 'json'
	}).then(function (res) {
		//24 hour pricing divided by 24 to obtain hourly rate
		var hourlyPrice = res.data.plans[1].price / 24;
		//multiply user hours to hourly price
		var userHourlyPrice = (userTime * hourlyPrice).toFixed(2);
		bikeApp.displayResults(distanceDurationMinutes, roundTripTime, userHourlyPrice);
	});
};

//template literals to print user results to DOM
bikeApp.displayResults = function (stationDistance, roundTripTravelTime, userFinalPrice) {
	var originDistanceKm = (bikeApp.shortestDistanceOriginStation.distance_origin / 1000).toFixed(2);
	var destinationDistanceKm = (bikeApp.shortestDistanceDestinationStation.distance_dest / 1000).toFixed(2);
	var originPoint = '<div class="pop-up-window"><p>Station closest to your origin: ' + bikeApp.shortestDistanceOriginStation.station_name + ', ' + originDistanceKm + 'km away</p></div>';
	var destinationPoint = '<div class="pop-up-window"><p>Station closest to your destination: ' + bikeApp.shortestDistanceDestinationStation.station_name + ', ' + destinationDistanceKm + 'km away</p></div>';
	var travelTimeContainer = $('<div>').addClass('travelTime');
	var travelTime = $("<p>").text('Travel Time: ' + Math.floor(stationDistance) + ' minutes');
	travelTimeContainer.append(travelTime);
	var priceContainer = $('<div>').addClass('priceContainer');
	var userPrice = $("<p>").text('Trip Cost: $' + userFinalPrice);
	priceContainer.append(userPrice);
	$('.trip-info').empty();
	if (destinationDistanceKm > 2) {
		var noStation = $('<div>').addClass('noStation');
		var noDestinationStation = $("<p>").text('There are no stations near your destination point.');
		noStation.append(noDestinationStation);
		var roundTrip = $('<div>').addClass('roundTrip');
		var originStationRoundTrip = $("<p>").text('Round Trip Time: ' + roundTripTravelTime + ' minutes');
		roundTrip.append(originStationRoundTrip);
		bikeApp.placeMarkers(originPoint, null, destinationDistanceKm);
		$(".trip-info").append(noStation, roundTrip, priceContainer);
	} else {
		bikeApp.placeMarkers(originPoint, destinationPoint, destinationDistanceKm);
		$(".trip-info").append(travelTimeContainer, priceContainer);
	}
};

//this is used to initialize the map 
var map;
//creating map
var initMap = function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: { lat: 43.6543, lng: -79.3860 },
		zoom: 11,
		styles: [{ "featureType": "administrative", "elementType": "labels.text.fill", "stylers": [{ "color": "#542437" }] }, { "featureType": "administrative.country", "elementType": "all", "stylers": [{ "saturation": "0" }] }, { "featureType": "landscape", "elementType": "all", "stylers": [{ "color": "#d6d4d4" }] }, { "featureType": "poi", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "road", "elementType": "all", "stylers": [{ "saturation": -100 }, { "lightness": 45 }] }, { "featureType": "road.highway", "elementType": "all", "stylers": [{ "visibility": "simplified" }] }, { "featureType": "road.arterial", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "featureType": "transit", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "water", "elementType": "all", "stylers": [{ "color": "#53777A" }, { "visibility": "on" }] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "lightness": "11" }, { "saturation": "18" }] }]
	});
	if (bikeApp.shortestDistanceDestinationLatLong !== undefined && bikeApp.shortestDistanceOriginLatLong !== undefined) {
		bikeApp.placeMarkers();
	}
};

//custom Map Markers + info windows on "click"
bikeApp.placeMarkers = function (origin, destination, distanceDestination) {

	var infowindowOrigin = new google.maps.InfoWindow({
		content: origin
	});

	var infowindowDestination = new google.maps.InfoWindow({
		content: destination
	});
	//custom marker info
	var customIcon = {
		url: './public/assets/images/citybike-marker.svg',
		size: new google.maps.Size(50, 70),
		anchor: new google.maps.Point(0, 70),
		scaledSize: new google.maps.Size(50, 70)
	};
	var markerOrigin = new google.maps.Marker({
		position: bikeApp.shortestDistanceOriginLatLong,
		map: map,
		title: 'origin marker',
		icon: customIcon
	});

	markerOrigin.addListener('click', function () {
		infowindowOrigin.open(map, markerOrigin);
	});
	//marker info if user is doing roundtrip
	if (distanceDestination < 2) {
		var markerDestination = new google.maps.Marker({
			position: bikeApp.shortestDistanceDestinationLatLong,
			map: map,
			title: 'destination marker',
			icon: customIcon
		});

		markerDestination.addListener('click', function () {
			infowindowDestination.open(map, markerDestination);
		});
	}
};

//background video JS

function scaleVideoContainer() {

	var height = $(window).height() + 5;
	var unitHeight = parseInt(height) + 'px';
	$('.homepage-hero-module').css('height', unitHeight);
}

function initBannerVideoSize(element) {

	$(element).each(function () {
		$(this).data('height', $(this).height());
		$(this).data('width', $(this).width());
	});

	scaleBannerVideoSize(element);
}

function scaleBannerVideoSize(element) {

	var windowWidth = $(window).width(),
	    windowHeight = $(window).height() + 5,
	    videoWidth,
	    videoHeight;

	$(element).each(function () {
		var videoAspectRatio = $(this).data('height') / $(this).data('width');

		$(this).width(windowWidth);

		if (windowWidth < 1000) {
			videoHeight = windowHeight;
			videoWidth = videoHeight / videoAspectRatio;
			$(this).css({ 'margin-top': 0, 'margin-left': -(videoWidth - windowWidth) / 2 + 'px' });

			$(this).width(videoWidth).height(videoHeight);
		}

		$('.homepage-hero-module .video-container video').addClass('fadeIn animated');
	});
}

//document ready
$(function () {
	bikeApp.init();
	scaleVideoContainer();

	initBannerVideoSize('.video-container .poster img');
	initBannerVideoSize('.video-container .filter');
	initBannerVideoSize('.video-container video');

	$(window).on('resize', function () {
		scaleVideoContainer();
		scaleBannerVideoSize('.video-container .poster img');
		scaleBannerVideoSize('.video-container .filter');
		scaleBannerVideoSize('.video-container video');
	});
});