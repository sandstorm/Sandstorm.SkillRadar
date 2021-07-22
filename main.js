var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var circleRadius = 2.5;
var pointSize = circleRadius * 0.1;
var svgSize = circleRadius * 400;
var svgMid = svgSize / 2;
var levels = 5;
var numberFeatures = 10;
var diagramValues = [];
var features = ["Softwarearchitektur", "Frontendentwicklung", "Backendentwicklung", "Design/UX", "Infrastruktur", "Operations", "Strategie", "Projektmanagement", "Marketing", "Social Consulting"];
var diagramTitles = ["Skills", "Interests"];
var radialScale = d3.scaleLinear()
    .domain([0, 10])
    .range([0, 250]);
function updateData(feature, k, n) {
    diagramValues[n][feature] = k * circleRadius;
    render(n);
}
function angleToCoordinate(angle, value) {
    var x = Math.cos(angle) * radialScale(value);
    var y = Math.sin(angle) * radialScale(value);
    return { "x": svgMid + x, "y": svgMid - y };
}
function getPathCoordinates(data_point) {
    var coordinates = [];
    for (var i = 0; i < features.length; i++) {
        var ft_name = features[i];
        var angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
        coordinates.push(angleToCoordinate(angle, data_point[ft_name]));
    }
    return coordinates;
}
function showPreSelected() {
    var topicSelection = document.getElementById("topicSelection");
    for (var i = 0; i < 2; i++) {
        var titleDiagram = document.createElement("input");
        titleDiagram.setAttribute("type", "text");
        titleDiagram.setAttribute("id", "titleDiagram" + i.toString());
        titleDiagram.setAttribute("name", i.toString());
        titleDiagram.value = diagramTitles[i];
        topicSelection.appendChild(titleDiagram);
    }
    var _loop_1 = function (i) {
        var index = i - 2;
        var newInput = document.createElement("input");
        newInput.setAttribute("type", "text");
        newInput.setAttribute("id", "selection" + index);
        newInput.setAttribute("name", index.toString());
        if (features[index])
            newInput.setAttribute("value", features[index]);
        topicSelection.appendChild(newInput);
        var removeInput = document.createElement("button");
        removeInput.innerHTML = "-";
        removeInput.setAttribute("type", "button");
        removeInput.addEventListener('click', function () { removeCategory(newInput, removeInput); });
        topicSelection.appendChild(removeInput);
    };
    for (var i = 2; i < (numberFeatures + 2); i++) {
        _loop_1(i);
    }
}
function addCategory() {
    numberFeatures++;
    features.push("");
    var topicSelection = document.getElementById("topicSelection");
    var newInput = document.createElement("input");
    newInput.setAttribute("type", "text");
    newInput.setAttribute("id", "selection" + numberFeatures);
    newInput.setAttribute("name", numberFeatures.toString());
    if (features[numberFeatures])
        newInput.setAttribute("value", features[numberFeatures]);
    topicSelection.appendChild(newInput);
    var removeInput = document.createElement("button");
    removeInput.innerHTML = "-";
    removeInput.setAttribute("type", "button");
    removeInput.addEventListener('click', function () { removeCategory(newInput, removeInput); });
    topicSelection.appendChild(removeInput);
}
function removeCategory(input, button) {
    input.remove();
    button.remove();
    features.splice(features.indexOf(input.value), 1);
    numberFeatures -= 1;
}
function getValues() {
    var urlSplit = window.location.href.split("?");
    if (urlSplit[1]) {
        features = [];
        var urlGetValues = urlSplit[1].split("&");
        numberFeatures = urlGetValues.length - 2;
        for (var i = 0; i < urlGetValues.length; i++) {
            if (i == 0) {
                var value = isolateGetParam(urlGetValues, i);
                diagramTitles[0] = value;
            }
            else if (i == 1) {
                var value = isolateGetParam(urlGetValues, i);
                diagramTitles[1] = value;
            }
            else {
                var value = isolateGetParam(urlGetValues, i);
                if (typeof value == "string") {
                    features.push(value);
                }
                else if (typeof value == "number") {
                }
            }
        }
    }
}
function isolateGetParam(urlGetValues, i) {
    var getValue = urlGetValues[i].split("=");
    var plusCheck = getValue[1].split("+");
    var slashCheck = getValue[1].split("%2F");
    var value;
    if (plusCheck[1]) {
        value = plusCheck[0] + " " + plusCheck[1];
    }
    else if (slashCheck[1]) {
        value = slashCheck[0] + "/" + slashCheck[1];
    }
    else {
        value = getValue[1];
    }
    return (value);
}
window.addEventListener('load', function () {
    getValues();
    var reducer = function (acc, current) {
        var _a;
        return (__assign(__assign({}, acc), (_a = {}, _a[current] = 0, _a)));
    };
    diagramValues.push(features.reduce(reducer, {}));
    diagramValues.push(features.reduce(reducer, {}));
    document.getElementById('addCategory').onclick = addCategory;
    showPreSelected();
    render(0);
    render(1);
});
function render(n) {
    var data = diagramValues[n];
    var oldSVG = document.getElementById('svg' + n.toString());
    if (oldSVG)
        oldSVG.remove();
    var svg = d3.select(document.getElementById("svgContainer" + n.toString())).append("svg")
        .attr("width", svgSize)
        .attr("height", svgSize)
        .attr("id", "svg" + n);
    for (var i = 0; i <= levels; i++) {
        var pos = i * circleRadius;
        svg.append("circle")
            .attr("cx", svgMid)
            .attr("cy", svgMid)
            .attr("fill", "none")
            .attr("stroke", "grey")
            .attr("r", radialScale(pos));
        svg.append("text")
            .attr("x", svgMid + 10)
            .attr("y", svgMid - radialScale(pos) - circleRadius * 2.5)
            .style("font-size", circleRadius * 5 + "px")
            .text(i.toString());
        if (i == levels) {
            svg.append("text")
                .attr("text-anchor", "middle")
                .attr("x", svgMid)
                .attr("y", svgMid - radialScale(pos) - radialScale(pos) * 0.3)
                .text(diagramTitles[n])
                .attr("font-weight", function (d, i) { return i * 100 + 100; })
                .attr("text-decoration", "underline")
                .style("font-size", 10 * circleRadius + "px");
        }
    }
    var _loop_2 = function (i) {
        var ft_name = features[i];
        var angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
        var line_coordinate = angleToCoordinate(angle, circleRadius * 5);
        var label_coordinate = angleToCoordinate(angle, circleRadius * 5.5);
        svg.append("line")
            .attr("x1", svgMid)
            .attr("y1", svgMid)
            .attr("x2", line_coordinate.x)
            .attr("y2", line_coordinate.y)
            .attr("stroke", "black");
        var label = svg.append("text")
            .attr("x", label_coordinate.x)
            .attr("y", label_coordinate.y)
            .text(ft_name)
            .attr("text-decoration", "underline")
            .style("font-size", circleRadius * 6 + "px");
        if (i == 0 || i == features.length / 2)
            label.attr("text-anchor", "middle");
        if (i < features.length / 2 && i > 0)
            label.attr("text-anchor", "end");
        var _loop_3 = function (k) {
            var pointCoordinate = angleToCoordinate(angle, k * circleRadius);
            var point = svg.append("circle")
                .attr("cx", pointCoordinate.x)
                .attr("cy", pointCoordinate.y)
                .attr("fill", "black")
                .attr("stroke", "grey")
                .attr("r", radialScale(pointSize))
                .on('click', function () { return updateData(ft_name, k, n); });
        };
        for (var k = 1; k <= levels; k++) {
            _loop_3(k);
        }
    };
    for (var i = 0; i < features.length; i++) {
        _loop_2(i);
    }
    var line = d3.line()
        .x(function (d) { return d.x; })
        .y(function (d) { return d.y; });
    var d = data;
    var color = "navy";
    var coordinates = getPathCoordinates(d);
    svg.append("path")
        .datum(coordinates)
        .attr("d", line)
        .attr("stroke-width", 3)
        .attr("stroke", color)
        .attr("fill", color)
        .attr("stroke-opacity", 1)
        .attr("opacity", 0.5)
        .attr("style", "pointer-events: none;");
}
function keyListener(event) {
    switch (event.keyCode) {
        case 222:
            test();
            break;
    }
}
function test() {
    console.log(diagramValues);
}
window.addEventListener("keydown", keyListener);
window.addEventListener("keyup", keyListener);
