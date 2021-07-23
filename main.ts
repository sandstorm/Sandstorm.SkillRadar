const initialCircleRadius: number = 3;
let circleRadius: number = initialCircleRadius;
let pointSize: number = circleRadius * 0.1;
let svgSize: number = circleRadius * 400;
let svgMid: number = svgSize / 2;
const levels: number = 5;
let numberFeatures: number = 10;

let diagramValues = [];
let features = ["Softwarearchitektur", "Frontendentwicklung", "Backendentwicklung", "Design/UX", "Infrastruktur", "Operations", "Strategie", "Projektmanagement", "Marketing", "Social Consulting"];
let diagramTitles = ["Skills", "Interests"];

function adjustToWindowSize() {
    for (let i = 0; i < features.length; i++) {
        diagramValues[0][features[i]] = diagramValues[0][features[i]] / circleRadius;
        diagramValues[1][features[i]] = diagramValues[1][features[i]] / circleRadius;
    }
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    const testedHeight = 1440;
    const testedWidth = 2560;

    const percent = (windowWidth / testedWidth) * 100;
    const newCircleSize = (initialCircleRadius * percent) / 100;
    circleRadius = newCircleSize;
    pointSize = circleRadius * 0.1;
    svgSize = circleRadius * 400;
    svgMid = svgSize / 2;
    for (let i = 0; i < features.length; i++) {
        diagramValues[0][features[i]] = diagramValues[0][features[i]] * circleRadius;
        diagramValues[1][features[i]] = diagramValues[1][features[i]] * circleRadius;
    }
    document.getElementById("selection").style.transform = "scale(" + (windowWidth / testedWidth + 0.2) + ")";
    render(0);
    render(1);
}

const radialScale = d3.scaleLinear()
    .domain([0, 10])
    .range([0, 250]);

//updating diagram data to show
function updateData(feature: string, k: number, n: number) {
    diagramValues[n][feature] = k;
    console.log(diagramValues)
    render(n);
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
        coordinates.push(angleToCoordinate(angle, data_point[ft_name] * circleRadius));
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
        newInput.setAttribute("id", "selection" + i)
        newInput.setAttribute("name", i.toString())
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

function diagramURL() {
    let jsonData: Array<Object> = new Array;

    jsonData = diagramValues;
    jsonData.push(diagramTitles);

    let dummy = document.createElement("input");
    document.body.appendChild(dummy);
    dummy.setAttribute("id", "dummy_id");
    document.getElementById("dummy_id").value = location.origin + location.pathname + "?data="  + encodeURIComponent(JSON.stringify(jsonData));
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}

function handleSubmit(event) {
    event.preventDefault();

    let jsonData: Array<Object> = new Array;
    const data = new FormData(event.target);
    let dataContainer = new Object;
    let titleContainer: Array<string> = new Array;
    
    data.forEach((d, i) => { 
        const index = Number(i);
        if (index == 0 || index == 1) {titleContainer.push(d)}
        else {
            dataContainer[d] = 0;
        }
    })
    for (let i = 0; i < diagramTitles.length; i++) {
        jsonData.push(dataContainer);
    }
    jsonData.push(titleContainer);

    const encodedData = encodeURIComponent(JSON.stringify(jsonData));

    window.open(location.origin + location.pathname + "?data=" + encodedData, "_self")
}

function deCodeURL() {
    const encodedData = new URLSearchParams(location.search).get("data");
    const decodedData = JSON.parse(decodeURIComponent(encodedData));
    diagramValues[0] = decodedData[0];
    diagramValues[1] = decodedData[1];
    diagramTitles = decodedData[2];

    //in features speichern
    features = Object.getOwnPropertyNames(diagramValues[0]);
    numberFeatures = features.length;
}

function printButton() {
    window.print();
}
// --------------------------------------------------------------------------------------------------------------


window.addEventListener('load', () => {
    /* window.addEventListener('resize', () => { adjustToWindowSize() }) */

    if (location.search) {
        deCodeURL();
    } else {
        const reducer = (acc, current) => ({
            ...acc,
            [current]: 0
        })
    
        diagramValues.push(features.reduce(reducer, {}))
        diagramValues.push(features.reduce(reducer, {}))
    }

    document.getElementById("urlButton").onclick = diagramURL;
    const form = document.querySelector('form');
    form.addEventListener('submit', handleSubmit);

    document.getElementById('addCategory').onclick = addCategory;
    document.getElementById("printButton").onclick = printButton;

    showPreSelected();
    adjustToWindowSize();
    render(0);
    render(1);
})



function render(n: number) {
    const data = diagramValues[n]

    const oldSVG = document.getElementById('svg' + n.toString());
    if (oldSVG) oldSVG.remove();
    const svg = d3.select(document.getElementById("svgContainer" + n.toString())).append("svg")
        .attr("width", svgSize)
        .attr("height", svgSize)
        .attr("id", "svg" + n)

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
                .text(diagramTitles[n])
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

            const point = svg.append("circle")
                .attr("cx", pointCoordinate.x)
                .attr("cy", pointCoordinate.y)
                .attr("fill", "black")
                .attr("stroke", "grey")
                .attr("r", radialScale(pointSize))

            const onclickArea = svg.append("circle")
                .attr("cx", pointCoordinate.x)
                .attr("cy", pointCoordinate.y)
                .attr("fill", "transparent")
                .attr("r", 9 * circleRadius)
                .on('click', () => updateData(ft_name, k, n))
        }

    }
    
    let line = d3.line()
        .x(d => d.x)
        .y(d => d.y);

        let d = data;
        
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




function keyListener(event) {
    switch (event.keyCode) {
        case 222: //test ä
            test();
            break
    }
}
function test() {
    if (location.search) { console.log(location.search) }
    else { console.log("no") }
}
window.addEventListener("keydown", keyListener);
window.addEventListener("keyup", keyListener);