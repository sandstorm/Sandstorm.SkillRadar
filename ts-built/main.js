window.addEventListener('load', function () {
    var svg = d3.select("body").append("svg")
        .attr("width", 600)
        .attr("height", 600);
    var radialScale = d3.scaleLinear()
        .domain([0, 10])
        .range([0, 250]);
    var ticks = [2, 4, 6, 8, 10];
    ticks.forEach(function (t) {
        return svg.append("circle")
            .attr("cx", 300)
            .attr("cy", 300)
            .attr("fill", "none")
            .attr("stroke", "gray")
            .attr("r", radialScale(t));
    });
});
