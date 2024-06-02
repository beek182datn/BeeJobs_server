new Chartist.Bar('#ct-custom-multiline', {
  labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  series: [
    [
      {meta: 'Ordered', value: 1},
      {meta: 'Ordered', value: 5},
      {meta: 'Ordered', value: 7},
      {meta: 'Ordered', value: 12},
      {meta: 'Ordered', value: 15},
      {meta: 'Ordered', value: 20},
      {meta: 'Ordered', value: 10}
    ],
    [
      {meta: 'Delivered', value: 2},
      {meta: 'Delivered', value: 4},
      {meta: 'Delivered', value: 8},
      {meta: 'Delivered', value: 11},
      {meta: 'Delivered', value: 16},
      {meta: 'Delivered', value: 19},
      {meta: 'Delivered', value: 9}
    ],
    [
      {meta: 'Reporeted', value: 3},
      {meta: 'Reporeted', value: 3},
      {meta: 'Reporeted', value: 9},
      {meta: 'Reporeted', value: 10},
      {meta: 'Reporeted', value: 17},
      {meta: 'Reporeted', value: 18},
      {meta: 'Reporeted', value: 8}
    ],
    [
      {meta: 'Arrived', value: 4},
      {meta: 'Arrived', value: 2},
      {meta: 'Arrived', value: 10},
      {meta: 'Arrived', value: 9},
      {meta: 'Arrived', value: 18},
      {meta: 'Arrived', value: 17},
      {meta: 'Arrived', value: 7}
    ]    
  ]
}, {
  seriesBarDistance: 15,
  height: "190px",
  fullWidth: true,
  chartPadding: {
    right: 10,
    left: 10,
    top: 20,
    bottom: 0,
  },
  axisX: {
    offset: 60
  },
  axisY: {
    offset: 30,
  },
  plugins: [
    Chartist.plugins.tooltip()
  ],
});