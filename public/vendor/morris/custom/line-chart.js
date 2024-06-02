new Morris.Line({
  // ID of the element in which to draw the chart.
  element: 'revenue',
  // Chart data records -- each entry in this array corresponds to a point on
  // the chart.
  data: [
    { day: 'Monday', Revenue: 10},
    { day: 'Tuesday', Revenue: 15},
    { day: 'Wednesday', Revenue: 25},
    { day: 'Thursday', Revenue: 15},
    { day: 'Friday', Revenue: 40 }
  ],
  // The name of the data record attribute that contains x-values.
  xkey: 'day',
  axes: false,
  parseTime: false,
  // A list of names of data record attributes that contain y-values.
  ykeys: ['Revenue'],
  // Labels for the ykeys -- will be displayed when you hover over the
  // chart.
  labels: ['Revenue'],
  pointStrokeColors: ['#000000', '#FFFFFF'],
	gridLineColor: "#ffd00b",
  lineColors: ['#000000','#FFFFFF'],
	behaveLikeLine: !0,
	pointSize: 3, 
	lineWidth: 2,
	hideHover: "auto",
	resize: true,
	redraw: true,  
});