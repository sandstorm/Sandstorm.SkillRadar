let circleRadius: number = 2.5;
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
    const testedCircleSize = 2.5;
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    const testedHeight = 1440;
    const testedWidth = 2560;

    const percent = (windowWidth / testedWidth) * 100;
    const newCircleSize = (testedCircleSize * percent) / 100;
    circleRadius = newCircleSize;
    pointSize = circleRadius * 0.1;
    svgSize = circleRadius * 400;
    svgMid = svgSize / 2;
    for (let i = 0; i < features.length; i++) {
        diagramValues[0][features[i]] = diagramValues[0][features[i]] * circleRadius; 
        diagramValues[1][features[i]] = diagramValues[1][features[i]] * circleRadius; 
    }
    document.getElementById("selection").style.transform = "scale("+ windowWidth / testedWidth + ")";
    render(0);
    render(1);
}

const radialScale = d3.scaleLinear()
    .domain([0, 10])
    .range([0, 250]);

//updating diagram data to show
function updateData(feature: string, k: number, n: number) {
    diagramValues[n][feature] = k * circleRadius;
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
    let value: string;
    if (plusCheck[1]) {
        value = plusCheck[0] + " " + plusCheck[1];
    } else if (slashCheck[1]) {
        value = slashCheck[0] + "/" + slashCheck[1];
    } else {
        value = getValue[1];
    }
    return (value);
}

function diagramURL() {
    let jsonData: Array<Object> = new Array;

    for (let i = 0; i < diagramValues.length; i++) {
        jsonData.push(diagramValues[i]);
    }
    const json = encodeURIComponent(JSON.stringify(jsonData));

    let dummy = document.createElement("input");
    document.body.appendChild(dummy);
    dummy.setAttribute("id", "dummy_id");
    document.getElementById("dummy_id").value = "http://127.0.0.1:5500/main.html?data=" + json;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}

function handleSubmit(event) {
    event.preventDefault();

    let jsonData: Array<Object> = new Array;

    /* console.log (Object.keys(diagramValues[0]).length) // returns 10
    console.log (Object.entries(diagramValues[0])) // returns 10 separate arrays of Object Keys */

    const data = new FormData(event.target);
    diagramTitles.forEach((d, i) => { console.log(d, i) })

    let dataContainer = new Object;
    for (let i = 0; i < diagramValues.length; i++) {
        data.forEach((d, index) => {
            const num: number = Number(index);
            console.log(num)
            if (num == 0 || num == 1) { }
            else { dataContainer[d] = diagramValues[i][d] }
        })
        jsonData.push(dataContainer);
        dataContainer = [];
    }
    console.log(jsonData)

    /* const json = JSON.stringify(jsonData);
    console.log(json) */
    /* window.open("main.html", "_self") */
}

function deCodeURL() {
    if (window.location.href.split("?")[1]) {
        const encoded = window.location.href.split("?")[1];
        const decoded = JSON.parse(encoded);
        console.log(decoded)
        diagramValues = decoded;
    }
}
// --------------------------------------------------------------------------------------------------------------


window.addEventListener('load', () => {
    window.addEventListener('resize', () => { adjustToWindowSize() })
    /* try {getValues()}
    catch (error) {console.log(error); deCodeURL()} */
    /* deCodeURL() */
    getValues();

    const reducer = (acc, current) => ({
        ...acc,
        [current]: 0
    })

    diagramValues.push(features.reduce(reducer, {}))
    diagramValues.push(features.reduce(reducer, {}))

    document.getElementById("urlButton").onclick = diagramURL;
    /* const form = document.querySelector('form');
    form.addEventListener('submit', handleSubmit); */

    document.getElementById('addCategory').onclick = addCategory;

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
    const jsonTest = window.location.href;
    console.log(JSON.stringify(jsonTest))
    console.log(JSON.parse(jsonTest))
}
window.addEventListener("keydown", keyListener);
window.addEventListener("keyup", keyListener);