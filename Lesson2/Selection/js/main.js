// Select the container
const svg = d3.select("#container");

// Select the first path
const select = d3.select("rect");

// Select all paths in the selection
const selectAll = d3.selectAll("rect");

console.log("svg", svg);
console.log("select", select);
console.log("selectAll", selectAll);

const colorScale = d3.scaleOrdinal(["#1f77b4", "#ff7f0e", "#2ca02c"]).domain(["bar Horsens", "cafe Horsens", "pizza Horsens"]); 
const legendData = colorScale.domain();
const legendSVG = d3.select("#legend")
const legendGroups = legendSVG.selectAll("g")
                                .data(legendData)
                                .join("g");

legendGroups.append("rect")
            .attr("width", 16)
            .attr("height", 16)
            .attr("fill", datum => colorScale(datum));

legendGroups.append("text")
            .text(datum => datum)
            .attr("x", 36)
            .attr("y", 12);

legendGroups.attr("transform", (datum, index) => `translate(${index * 150}, 0)`);

const addText = d3.selectAll("rect").append("p");
console.log("test", addText);

// Exercise 1.2 – Load the Data
async function loadData() {
    const data = await d3.json("./data/going_out_in_horsens_kw.json");
    // Create an array with all formatted data using flatMap()
    const formattedData = data.flatMap(formatDatum);

    // Exercise 1.4 – Measure the Data
    // a) Group the data by type
    const groupedData = d3.groups(
        formattedData,
        datum => datum.type
    );
    console.log("Grouped Data:", groupedData);

    // b) Inspect each type
    groupedData.forEach(([type, values]) => {
    console.log(type, values);
    });
}
loadData();

// Exercise 1.3 – Format the Data
function formatDatum(datum) {
    const date = new Date(datum.date);
    const types = ["bar Horsens", "cafe Horsens", "pizza Horsens"];

    const formattedData = types.map(type => {
        return {
            date: date,
            type: type,
            value: datum[type]
        };
    });
    return formattedData;
}
