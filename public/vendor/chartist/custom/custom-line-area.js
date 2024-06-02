var chart = new Chartist.Line('#ct-custom-line', {
	labels: [1, 2, 3, 4, 5],
	series: [
		[
			{meta: 'Sales', value: 5 },
			{meta: 'Sales', value: 9},
			{meta: 'Sales', value: 7},
			{meta: 'Sales', value: 8 },
			{meta: 'Sales', value: 5},
			{meta: 'Sales', value: 3},
			{meta: 'Sales', value: 5 },
			{meta: 'Sales', value: 4},	
		]
	]
}, {
	// Remove this configuration to see that chart rendered with cardinal spline interpolation
	// Sometimes, on large jumps in data values, it's better to use simple smoothing.
	lineSmooth: Chartist.Interpolation.simple({
		divisor: 2
	}),
	showArea: true,
	height: "250px",
	fullWidth: true,
	chartPadding: {
		right: 10,
		left: 10,
		top: 30,
		bottom: 0,
	},
	axisX: {
		offset: 10,
	}, 
	axisY: {
		offset: 0,
	},
	plugins: [
		Chartist.plugins.tooltip()
	],
	low: 0,
});

chart.on('draw', function(data) {
	if(data.type === 'line' || data.type === 'area') {
		data.element.animate({
			d: {
				begin: 2000 * data.index,
				dur: 2000,
				from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
				to: data.path.clone().stringify(),
				easing: Chartist.Svg.Easing.easeOutQuint
			}
		});
	}
});