// Morris Days
var day_data = [
	{"period": "2016-10-01", "licensed": 3213, "Kingfisher": 887},
	{"period": "2016-09-30", "licensed": 3321, "Kingfisher": 776},
	{"period": "2016-09-29", "licensed": 3671, "Kingfisher": 884},
	{"period": "2016-09-20", "licensed": 3176, "Kingfisher": 448},
	{"period": "2016-09-19", "licensed": 3376, "Kingfisher": 565},
	{"period": "2016-09-18", "licensed": 3976, "Kingfisher": 627},
	{"period": "2016-09-17", "licensed": 2239, "Kingfisher": 660},
	{"period": "2016-09-16", "licensed": 3871, "Kingfisher": 676},
	{"period": "2016-09-15", "licensed": 3659, "Kingfisher": 656},
	{"period": "2016-09-10", "licensed": 3380, "Kingfisher": 663}
];
Morris.Line({
	element: 'dayData',
	data: day_data,
	xkey: 'period',
	ykeys: ['licensed', 'Kingfisher'],
	labels: ['Licensed', 'Kingfisher'],
	resize: true,
	hideHover: "auto",
	gridLineColor: "#e4e6f2",
	pointFillColors:['#ffffff'],
	pointStrokeColors: ['#ff5661'],
	lineColors:['#118cf1', '#FF7E39'],
});