d3.select(window).on('resize', makeResponsive);

// When the browser loads, makeResponsive() is called.
makeResponsive();

// The code for the chart is wrapped inside a function that automatically resizes the chart
function makeResponsive() {
    // if the SVG area isn't empty when the browser loads,
    // remove it and replace it with a resized version of the chart
    var svgArea = d3.select("body").select("svg");

    // clear svg is not empty
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    // SVG wrapper dimensions are determined by the current width and
    // height of the browser window.
    var svgWidth = window.innerWidth;
    var svgHeight = window.innerHeight;

    var margin = {
        top: 50,
        bottom: 50,
        right: 50,
        left: 50
    };

    var h = svgHeight - margin.top - margin.bottom;
    var w = svgWidth - margin.left - margin.right;
    // var chart = d3.select("#scatter").append("div").classed("chart", true);

    // Append SVG element
    var svg = d3.select("#scatter")
        .append("svg")
        .attr("height", svgHeight)
        .attr("width", svgWidth);

    // // Append group element
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);


    // Read CSV
    d3.csv("assets/data/data.csv").then (function (newsData) {

        // parse data
        newsData.forEach(function (data) {
            data.poverty = +data.poverty;
            data.healthcare = +data.healthcare;
        });

        // create scales
        var xScale = d3.scaleLinear().range([0, w]);
        var yScale = d3.scaleLinear().range([h, 0]);

        var xAxis = d3.axisBottom(xScale);
        var yAxis = d3.axisLeft(yScale);

        var xMin;
        var xMax;
        var yMin;
        var yMax;

        xMin = d3.min(newsData, function (data) {
            return data.poverty;
        });

        xMax = d3.max(newsData, function (data) {
            return data.poverty;
        });

        yMin = d3.min(newsData, function (data) {
            return data.healthcare;
        });

        yMax = d3.max(newsData, function (data) {
            return data.healthcare;
        });

        xScale.domain([xMin, xMax]);
        yScale.domain([yMin, yMax]);

        console.log(xMin);
        console.log(yMax);

        // append x axis
        chartGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${h})`)
            .call(xAxis);

        // append y axis
        chartGroup.append("g")
            .call(yAxis);

        // toolTip
        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([0, 10])
            .html(function (d) {
                return (`State: ${d.state}<br>Poverty Rate: ${d.poverty}%<br>Lacks Healthcare Rate ${d.healthcare}%`);
            });

        chartGroup.call(toolTip);

        // Circles
        chartGroup.selectAll("dot")
            .data(newsData)
            .enter()
            .append("circle")
            .attr("r", 10)
            .attr("cx", d => xScale(d.poverty))
            .attr("cy", d => yScale(d.healthcare))
            .classed("stateCircle", true)
            .on("mouseover", function (data) {
                toolTip.show(data, this);
            }).on("mouseout", function (data, index) {
                toolTip.hide(data);
            });

        //Adding Plot Text 
        chartGroup.selectAll("dot")
            .data(newsData)
            .enter()
            .append("text")
            .attr("x", d => xScale(d.poverty))
            .attr("y", d => yScale(d.healthcare) + 1)
            .text(d => d.abbr)
            .attr("font-size", "10px")
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .on("mouseover", function (data) {
                toolTip.show(data, this);
            }).on("mouseout", function (data, index) {
                toolTip.hide(data);
            });

        // Create axes labels

        var x_labels = chartGroup.append("g")
            .attr("transform", `translate(${w / 2}, ${h + margin.top - 20})`)

        var povertyLabel = x_labels.append("text")
            .attr("x", 0)
            .attr("y", 10)
            .attr("value", "poverty")
            .classed("active", true)
            .text("In Poverty (%)");

        var y_labels = chartGroup.append("g")
            .attr("transform", "rotate(-90)")

        var healthcareLabel = y_labels.append("text")
            .attr("x", 0 - (h / 2))
            .attr("y", 15 - margin.left)
            .attr("value", "healthcare")
            .classed("active", true)
            .text("Lacks Healthcare (%)");

    }).catch(function (error) {
        console.log(error);
    });
}
