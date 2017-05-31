const bikeApp = {};
bikeApp.cityBikesUrl = 'http://api.citybik.es/v2/networks';
bikeApp.cityBikesToronto = 'https://tor.publicbikesystem.net/ube/gbfs/v1/';

bikeApp.init = function() {
	bikeApp.getCityBikes();
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
	});
};


// next ajax request
// get system information, station information url, system pricing plans
// next ajax request
// using station information url - get station data locations

$(function() {
	bikeApp.init();
});

