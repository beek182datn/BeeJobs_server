// Displaying X Labels Diagonally (Bar Chart)
var day_data = [
	{"period": "Sun", "Delivered": 1, "Ordered": 2, "Reporeted": 3, "Arrived": 4},
	{"period": "Mon", "Delivered": 5, "Ordered": 4, "Reporeted": 3, "Arrived": 2},
	{"period": "Tue", "Delivered": 7, "Ordered": 8, "Reporeted": 9, "Arrived": 10},
	{"period": "Wed", "Delivered": 12, "Ordered": 11, "Reporeted": 10, "Arrived": 9},
	{"period": "Thu", "Delivered": 15, "Ordered": 16, "Reporeted": 17, "Arrived": 18},
	{"period": "Fri", "Delivered": 20, "Ordered": 19, "Reporeted": 18, "Arrived": 17},
	{"period": "Sat", "Delivered": 10, "Ordered": 9, "Reporeted": 8, "Arrived": 7},
];
Morris.Bar({
	element: 'xLabelsDiagonally',
	data: day_data,
	xkey: 'period',
	ykeys: ['Delivered', 'Ordered', 'Reporeted', 'Arrived'],
	labels: ['Delivered', 'Ordered', 'Reporeted', 'Arrived' ],
	xLabelAngle: 60,
	gridLineColor: "#2999f5",
	resize: true,
	gridTextColor: 'rgba(255, 255, 255, 0.7)',
	gridTextSize: '12',
	hideHover: "auto",
	resize: true,
	barColors:['#04fcff', '#d8ff79', '#adff2f', '#ffef33'],
});