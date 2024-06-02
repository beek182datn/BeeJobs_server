$(function() {
	var updatingChart = $(".updating-chart-one").peity("line", {
		width: 150,
		height: 30,
		stroke: "rgba(0, 0, 0, 0.1)",
		fill: false,
		strokeWidth: 3,
	});
	setInterval(function() {
		var random = Math.round(Math.random() * 10)
		var values = updatingChart.text().split(",")
		values.shift()
		values.push(random)

		updatingChart
		.text(values.join(","))
		.change()
	}, 1000)
})
$(function() {
	var updatingChart = $(".updating-chart-two").peity("line", {
		width: 150,
		height: 30,
		stroke: "rgba(0, 0, 0, 0.1)",
		fill: false,
		strokeWidth: 3,
	});
	setInterval(function() {
		var random = Math.round(Math.random() * 10)
		var values = updatingChart.text().split(",")
		values.shift()
		values.push(random)

		updatingChart
		.text(values.join(","))
		.change()
	}, 1000)
})
$(function() {
	var updatingChart = $(".updating-chart-three").peity("line", {
		width: 150,
		height: 30,
		stroke: "#0063bf",
		fill: false,
		strokeWidth: 3,
	});
	setInterval(function() {
		var random = Math.round(Math.random() * 10)
		var values = updatingChart.text().split(",")
		values.shift()
		values.push(random)
		updatingChart
		.text(values.join(","))
		.change()
	}, 1000)
})
$(function() {
	var updatingChart = $(".updating-chart-four").peity("line", {
		width: 90,
		height: 20,
		stroke: "#5a66b5",
		fill: false,
		strokeWidth: 3,
	});
	setInterval(function() {
		var random = Math.round(Math.random() * 10)
		var values = updatingChart.text().split(",")
		values.shift()
		values.push(random)

		updatingChart
		.text(values.join(","))
		.change()
	}, 1000)
})
$(function() {
	var updatingChart = $(".updating-chart-five").peity("line", {
		width: 90,
		height: 20,
		stroke: "#ff0c06",
		fill: false,
		strokeWidth: 3,
	});
	setInterval(function() {
		var random = Math.round(Math.random() * 10)
		var values = updatingChart.text().split(",")
		values.shift()
		values.push(random)

		updatingChart
		.text(values.join(","))
		.change()
	}, 1000)
})
$(function() {
	var updatingChart = $(".updating-chart-six").peity("line", {
		width: 180,
		height: 40,
		stroke: "#ff0c06",
		fill: false,
		strokeWidth: 3,
	});
	setInterval(function() {
		var random = Math.round(Math.random() * 10)
		var values = updatingChart.text().split(",")
		values.shift()
		values.push(random)

		updatingChart
		.text(values.join(","))
		.change()
	}, 1000)
})

$(function() {
	var updatingChart = $(".updating-chart-seven").peity("line", {
		width: 90,
		height: 20,
		stroke: "#a5b936",
		fill: false,
		strokeWidth: 3,
	});
	setInterval(function() {
		var random = Math.round(Math.random() * 10)
		var values = updatingChart.text().split(",")
		values.shift()
		values.push(random)

		updatingChart
		.text(values.join(","))
		.change()
	}, 1000)
})
$(function() {
	var updatingChart = $(".updating-chart-eight").peity("line", {
		width: 90,
		height: 20,
		stroke: "#ffda3e",
		fill: false,
		strokeWidth: 3,
	});
	setInterval(function() {
		var random = Math.round(Math.random() * 10)
		var values = updatingChart.text().split(",")
		values.shift()
		values.push(random)

		updatingChart
		.text(values.join(","))
		.change()
	}, 1000)
})


// Bar Chart
$(function(){
	$(".bar-one").peity("bar", {
		width: 90,
		height: 40,
		fill: ["#1d6bf1"],
	})
});
$(function(){
	$(".bar-two").peity("bar", {
		width: 90,
		height: 40,
		fill: ["#fe6235"],
	})
});
$(function(){
	$(".bar-three").peity("bar", {
		width: 90,
		height: 40,
		fill: function(_, i, all) {
			var g = parseInt((i / all.length) * 255)
			return "rgb(15, " + g + ", 220)"
		}
	})
});

// Line Chart
$(function(){
	$(".line-one").peity("line", {
		width: 90,
		height: 18,
		stroke: ["#118cf1"],
		fill: false,
		strokeWidth: 3,
	})
});
$(function(){
	$(".line-two").peity("line", {
		width: 90,
		height: 18,
		stroke: ["#50b924"],
		fill: false,
		strokeWidth: 3,
	})
});
$(function(){
	$(".line-three").peity("line", {
		width: 90,
		height: 18,
		stroke: ["#ffda3e"],
		fill: false,
		strokeWidth: 3,
	})
});
$(function(){
	$(".line-four").peity("line", {
		width: 90,
		height: 18,
		stroke: ["#FF7E39"],
		fill: false,
		strokeWidth: 3,
	})
});
$(function(){
	$(".line-five").peity("line", {
		width: 90,
		height: 18,
		stroke: ["#f15f79"],
		fill: false,
		strokeWidth: 3,
	})
});

$(function(){
	$(".line-six").peity("line", {
		width: 90,
		height: 18,
		stroke: ["#5a66b5"],
		fill: false,
		strokeWidth: 3,
	})
});
$(function(){
	$(".line-seven").peity("line", {
		width: 90,
		height: 18,
		stroke: ["#ff0c06"],
		fill: false,
		strokeWidth: 3,
	})
});
