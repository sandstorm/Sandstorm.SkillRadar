let circleRadius: number = 3;
let pointSize: number = circleRadius * 0.1;
let svgSize: number = circleRadius * 400;
let svgMid: number = svgSize / 2;
const levels: number = 5;
let numberFeatures: number = 10;

let data = [];
let features = ["Softwarearchitektur", "Frontendentwicklung", "Backendentwicklung", "Design/UX", "Infrastruktur", "Operations", "Strategie", "Projektmanagement", "Marketing", "Social Consulting"];
let diagramTitles = ["Skills", "Interests"];
const alphabet = "abcdefghijklmnopqrstuvwxyzäöü";

const radialScale = d3.scaleLinear()
    .domain([0, 10])
    .range([0, 250]);


function updateData(feature: string, k: number) {
    data[0][feature] = k * circleRadius;
    render(data);
}

function angleToCoordinate(angle, value) {
    let x = Math.cos(angle) * radialScale(value);
    let y = Math.sin(angle) * radialScale(value);
    return { "x": svgMid + x, "y": svgMid - y };
}

function getPathCoordinates(data_point) {
    let coordinates = [];
    for (let i = 0; i < features.length; i++) {
        let ft_name = features[i];
        let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
        coordinates.push(angleToCoordinate(angle, data_point[ft_name]));
    }
    return coordinates;
}

function showPreSelected() {
    const topicSelection = document.getElementById("topicSelection");
    for (let i = 0; i < 2; i++) {
        let titleDiagram = document.createElement("input");
        titleDiagram.setAttribute("type", "text");
        titleDiagram.setAttribute("id", "titleDiagram" + i.toString());
        titleDiagram.setAttribute("name", i.toString());
        titleDiagram.value = diagramTitles[i];
        topicSelection.appendChild(titleDiagram);
    }

    for (let i = 2; i < (numberFeatures + 2); i++) {
        const index = i - 2;
        let newInput = document.createElement("input");
        newInput.setAttribute("type", "text");
        newInput.setAttribute("id", "selection" + index)
        newInput.setAttribute("name", index.toString())
        if (features[index]) newInput.setAttribute("value", features[index]);
        topicSelection.appendChild(newInput);

        let removeInput = document.createElement("button");
        removeInput.innerHTML = "-";
        removeInput.setAttribute("type", "button");
        removeInput.addEventListener('click', () => { removeCategory(newInput, removeInput) })
        topicSelection.appendChild(removeInput);
    }
}

function addCategory() {
    numberFeatures++;
    features.push("");
    const topicSelection = document.getElementById("topicSelection");

    let newInput = document.createElement("input");
    newInput.setAttribute("type", "text");
    newInput.setAttribute("id", "selection" + numberFeatures)
    newInput.setAttribute("name", numberFeatures.toString())
    if (features[numberFeatures]) newInput.setAttribute("value", features[numberFeatures]);
    topicSelection.appendChild(newInput);

    let removeInput = document.createElement("button");
    removeInput.innerHTML = "-";
    removeInput.setAttribute("type", "button");
    removeInput.addEventListener('click', () => { removeCategory(newInput, removeInput) })
    topicSelection.appendChild(removeInput);
}

function removeCategory(input, button) {
    input.remove();
    button.remove();

    features.splice(features.indexOf(input.value), 1)
    numberFeatures -= 1;
}

function getValues() {
    const urlSplit = window.location.href.split("?");
    if (urlSplit[1]) {
        features = [];
        const urlGetValues = urlSplit[1].split("&");
        numberFeatures = urlGetValues.length - 2;
        for (let i = 0; i < urlGetValues.length; i++) {
            if (i == 0) {
                const value = isolateGetParam(urlGetValues, i);
                diagramTitles[0] = value;
            } else if (i == 1) {
                const value = isolateGetParam(urlGetValues, i);
                diagramTitles[1] = value;
            } else {
                const value = isolateGetParam(urlGetValues, i);
                if (typeof value == "string") {
                    features.push(value)
                } else if (typeof value == "number") {

                }
            }
        }
    }
}

function isolateGetParam(urlGetValues, i) {
    const getValue = urlGetValues[i].split("=");
    const plusCheck = getValue[1].split("+");
    const slashCheck = getValue[1].split("%2F");
    if (plusCheck[1]) {
        const value = plusCheck[0] + " " + plusCheck[1];
    } else if (slashCheck[1]) {
        const value = slashCheck[0] + "/" + slashCheck[1];
    } else {
        const value = getValue[1];
    }
    return (value);
}

// --------------------------------------------------------------------------------------------------------------


window.addEventListener('load', () => {
    document.getElementById("scale").addEventListener('change', (event) => {
        circleRadius = event.target.value;
        pointSize = circleRadius * 0.1;
        svgSize = circleRadius * 400;
        svgMid = svgSize / 2;

        render(data);
    })
    getValues();

    let point = {}
    features.forEach(f => point[f] = 0);
    data.push(point);

    document.getElementById('addCategory').onclick = addCategory;

    showPreSelected();
    render(data);
})



function render(data: object) {
    const oldSVG = document.getElementById('svg');
    if (oldSVG) oldSVG.remove();
    const svg = d3.select(document.getElementById("svgContainer")).append("svg")
        .attr("width", svgSize)
        .attr("height", svgSize)
        .attr("id", "svg")

    for (let i: number = 0; i <= levels; i++) {
        const pos = i * circleRadius;
        svg.append("circle")
            .attr("cx", svgMid)
            .attr("cy", svgMid)
            .attr("fill", "none")
            .attr("stroke", "grey")
            .attr("r", radialScale(pos))

        svg.append("text")
            .attr("x", svgMid + 10)
            .attr("y", svgMid - radialScale(pos) - circleRadius * 2.5)
            .style("font-size", circleRadius * 5 + "px")
            .text(i.toString())

        if (i == levels) {
            svg.append("text")
                .attr("text-anchor", "middle")
                .attr("x", svgMid)
                .attr("y", svgMid - radialScale(pos) - radialScale(pos) * 0.3)
                .text(diagramTitles[0])
                .attr("font-weight", function (d, i) { return i * 100 + 100; })
                .attr("text-decoration", "underline")
                .style("font-size", 10 * circleRadius + "px")
        }
    }


    for (let i: number = 0; i < features.length; i++) {
        const ft_name = features[i];
        const angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
        const line_coordinate = angleToCoordinate(angle, circleRadius * 5);
        const label_coordinate = angleToCoordinate(angle, circleRadius * 5.5);

        //draw axis line
        svg.append("line")
            .attr("x1", svgMid)
            .attr("y1", svgMid)
            .attr("x2", line_coordinate.x)
            .attr("y2", line_coordinate.y)
            .attr("stroke", "black");

        //draw axis label
        let label = svg.append("text")
            .attr("x", label_coordinate.x)
            .attr("y", label_coordinate.y)
            .text(ft_name)
            .attr("text-decoration", "underline")
            .style("font-size", circleRadius * 6 + "px")
        if (i == 0 || i == features.length / 2) label.attr("text-anchor", "middle");
        if (i < features.length / 2 && i > 0) label.attr("text-anchor", "end");

        for (let k = 1; k <= levels; k++) {
            const pointCoordinate = angleToCoordinate(angle, k * circleRadius)
            const id = i.toString() + k.toString();

            const point = svg.append("circle")
                .attr("cx", pointCoordinate.x)
                .attr("cy", pointCoordinate.y)
                .attr("fill", "black")
                .attr("stroke", "grey")
                .attr("r", radialScale(pointSize))
                .attr("id", id)
                .on('click', () => updateData(ft_name, k))
        }

    }

    let line = d3.line()
        .x(d => d.x)
        .y(d => d.y);

    for (let i = 0; i < data.length; i++) {
        let d = data[i];

        let color = "navy";
        let coordinates = getPathCoordinates(d);

        svg.append("path")
            .datum(coordinates)
            .attr("d", line)
            .attr("stroke-width", 3)
            .attr("stroke", color)
            .attr("fill", color)
            .attr("stroke-opacity", 1)
            .attr("opacity", 0.5)
            .attr("style", "pointer-events: none;")
    }
}




function keyListener(event) {
    switch (event.keyCode) {
        case 222: //test ä
            test();
            break
    }
}
function test() {
    console.log(data, secondData)
}
window.addEventListener("keydown", keyListener);
window.addEventListener("keyup", keyListener);