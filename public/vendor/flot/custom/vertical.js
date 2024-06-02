$(function () {

	var d1, data, chartOptions;

	d1 = [
		[1325376000000, 2200],
		[1328054400000, 1700],
		[1330560000000, 1300],
		[1333238400000, 900],
		[1335830400000, 550]
	];

	data = [{
		label: 'Clicks',
		data: d1
	}];

	chartOptions = {
		xaxis: {
			min: (new Date(2011, 11, 15)).getTime(),
			max: (new Date(2012, 04, 18)).getTime(),
			mode: "time",
			tickSize: [4, "month"],
			monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
		},
		grid:{
			hoverable: true,
			clickable: false,
			borderWidth: 1,
			tickColor: '#f5f6fa',
			borderColor: '#f5f6fa',
		},
		bars: {
			show: true,
			barWidth: 48*24*60*60*300,
			fill: true,
			lineWidth: 1,
			order: true,
			lineWidth: 0,
			fillColor: { colors: [ { opacity: 1 }, { opacity: 1 } ] }
		},
		shadowSize: 0,
		tooltip: true,
		tooltipOpts: {
			content: '%s: %y'
		},
		colors: ['#99ccff', '#c1e0ff', '#eaf4ff'],
	}
	var holder = $('#vertical-chart');
	if (holder.length) {
		$.plot(holder, data, chartOptions );
	}
});