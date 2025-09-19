const url = "energynetworks.csv";

const taxonomy = {
	//task: ["identify", "monitor", "analyse"],
	//identify: ["mapped", "distorted", "abstract"],
	//monitor: ["single", "mapped_or_abstract", "multiple"],
	//analyse: ["passive", "exploration", "navigation", "filter_and_focus", "personalisation"]
};

const facets = Object.keys(taxonomy);


const evalmethods = [
	"Deployed_Systems_(Implicit_Validation)",
	"Formal_Evaluation_with_Operators",
	"Formal_Evaluation_without_Operators",
	"Technical_Validation_Only",
	"Demonstration/Case_Study",
	"No_Validation_Reported"
]

const container = d3.select(".grid");

// Initialize slider
//var slider = d3.slider().min(0).max(10).ticks(10).showRange(true).value(6);
// Render the slider in the div
//d3.select('#slider').call(slider);

// create checkboxes to filter techniques
var filters = d3
	.select("#filters")
	.selectAll("div")
	.data(facets)
	.enter()
	.append("div")
	.attr("id", (d) => "select_" + d);

filters
	.append("h3")
	// .html(d => '<div class="legend_circle ' + d + '"></div>' + formatText(d));
	.html((d) => formatText(d));

var checkboxes = filters
	.selectAll("input")
	.data((d) => taxonomy[d])
	.enter()
	.append("div")
	.classed("checkbox-container", true);
checkboxes
	.append("input")
	.attr("type", "checkbox")
	.attr("class", "input")
	.attr("id", function (d) {
		return (
			"check_" + d3.select(this.parentNode.parentNode).datum() + "_" + d
		);
	})
	.attr("value", (d) => d);
checkboxes
	.append("label")
	.attr("for", function (d) {
		return (
			"check_" + d3.select(this.parentNode.parentNode).datum() + "_" + d
		);
	})
	.append("span")
	.text((d) => formatText(d));

// checkboxes for evaluation methods
var checkData = d3
	.select("#filters_eval")
	.selectAll("div")
	.data(evalmethods)
	.enter()
	.append("div");
checkData
	.append("input")
	.attr("type", "checkbox")
	.attr("class", "input")
	.attr("id", (d) => "check_" + d.replace(/[()\/]/g, '_')) // Replace special chars with underscore
	.attr("value", (d) => d);
checkData
	.append("label")
	.attr("for", (d) => "check_" + d.replace(/[()\/]/g, '_')) // Replace special chars with underscore
	.append("span")
	.text((d) => sentenceCase(d));

d3.select("#showall").on("click", function () {
	d3.selectAll("input").property("checked", false);
	// dispatch event to reload techniques
	let event = new Event("change");
	eventHandler.dispatchEvent(event);
});

d3.csv(url)
	.then(function (data) {
		//console.log(data);

		// display count
		d3.selectAll("#count, #total").text(data.length);

		// listen for changes in filters
		d3.selectAll(".input").on("change", function () {
			// get filter values
			var filters = facets.map(function (facet) {
				var cats = [];

				taxonomy[facet].forEach(function (cat) {
					if (
						d3
							.select("#check_" + facet + "_" + cat)
							.property("checked")
					) {
						cats.push(cat);
						console.log(cat);
					}
				});
				return [facet, cats];


			});

			var evalFilters = evalmethods.filter(function (d) {
				return d3.select("#check_" + d.replace(/[()\/]/g, '_')).property("checked");
			});

			// update
			refreshTechniques(filters, evalFilters);
		});

		function refreshTechniques(filters, evalFilters) {
			// filter
			var fData = data.filter((d) => filterData(d, filters, evalFilters));
			console.log(fData);
			// update count in heading
			d3.select("#count").text(fData.length);
			// get IDs of techniques matching filter
			var ids = fData.map((d) => d.image);
			// hide all non-matching ones
			d3.selectAll(".grid-item").style("display", (d) =>
				ids.indexOf(d.image) != -1 ? null : "none"
			);
			// update layout
			msnry.layout();
		}

		// draw boxes for papers
		var div = container
			.selectAll("div")
			.data(data)
			.enter()
			.append("div")
			.classed("grid-item", true);

		div.append("img").attr("src", (d) => "energyimg/" + d.image + ".png");
		div.append("h2").text((d) => d.Title);
		div.append("span").html((d) =>
			[
				d["Author ACM"],
				". <i>",
				d["Publication Title"],
				"</i> (",
				d["Publication Year"],
				")",
				' <a href="' + encodeURI(d.URL) + '" target="_blank">[Link]</a>',
				"<br>",
			].join("")
		);
		var tags = div.append("div").style("margin-top", "7px");

		// add tags on technique cards
		//facets.forEach(function (facet) {
		//	tags.append("div")
		//		.classed("tag", true)
		//		.classed(facet, true)
		//		.html((d) => d[facet]);
		//});

		// add user notes
		//div.append("h4").text((d) => d.Notes);
	})
	.then(function () {
		imagesLoaded(".grid", function () {
			var elem = document.querySelector(".grid");
			window.msnry = new Masonry(elem, {
				// options
				itemSelector: ".grid-item",
				columnWidth: 241,
				gutter: 15,
			});
		});
	})
	.catch(function (error) {
		throw error;
	});




function filterData(d, filters, evalFilters) {
	return (
		filters.every(function (fil) {
			// facet: fil[0]
			// selected: fil[1]
			// check if either array is empty or category is selected
			//console.log(fil[1]);
			return fil[1].length == 0 || fil[1].indexOf(d[fil[0]]) != -1;
		}) &&

		// dataFilters.every(function (fil) {
		// 	return d[fil] == "yes";
		// }) &&
		// pubFilters.every(function (fil) {
		// 	return d[fil] == "yes";
		// }) &&
		evalFilters.every(function (fil) {
			return d[fil] == "yes";
		})

	);
}

function unique(arr, acc) {
	return arr.map(acc).filter(function (value, index, self) {
		return self.indexOf(value) === index;
	});
}

function formatText(str) {
	// capitalise and replace underscores by spaces
	// replace first letter
	str = str.slice(0, 1).toUpperCase() + str.slice(1);
	// find all underscores, replace by spaces and capitalise following letter
	while (str.indexOf("_") != -1) {
		str =
			str.slice(0, str.indexOf("_")) +
			" " +
			str
				.slice(str.indexOf("_") + 1, str.indexOf("_") + 2)
				.toUpperCase() +
			str.slice(str.indexOf("_") + 2);
	}
	return str;
}

function sentenceCase(str) {
	// capitalise first word and replace underscores by spaces
	// replace first letter
	str = str.slice(0, 1).toUpperCase() + str.slice(1);
	// find all underscores, replace by spaces and capitalise following letter
	while (str.indexOf("_") != -1) {
		str =
			str.slice(0, str.indexOf("_")) +
			" " +
			str.slice(str.indexOf("_") + 1);
	}
	return str;
}
