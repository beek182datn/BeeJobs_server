var chart = new Chartist.Line('#ct-custom-line2', {
	labels: [1, 2, 3, 4, 5],
	series: [
		[
			{meta: 'Sunday', value: 5},
			{meta: 'Monday', value: 9},
			{meta: 'Tuesday', value: 7},
			{meta: 'Wednesday', value: 8},
			{meta: 'Thursday', value: 5},
			{meta: 'Friday', value: 3},
			{meta: 'Saturday', value: 5}
		]
	]
}, {
	// Remove this configuration to see that chart rendered with cardinal spline interpolation
	// Sometimes, on large jumps in data values, it's better to use simple smoothing.
	lineSmooth: Chartist.Interpolation.simple({
		divisor: 2
	}),
	height: "120px",
	fullWidth: true,
	chartPadding: {
		right: 10,
		left: 10,
		top: 30,
		bottom: 0,
	},
	axisX: {
		offset: 10,
		showGrid: false,
		showLabel: false,
	}, 
	axisY: {
		offset: 0,
		showGrid: false,
		showLabel: false,		
	},
	plugins: [
		Chartist.plugins.tooltip()
	],
	low: 0,
});
