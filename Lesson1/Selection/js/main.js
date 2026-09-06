// Select the container
const svg = d3.select("#container");

// Select the first path
const select = d3.select("rect");

// Select all paths in the selection
const selectAll = d3.selectAll("rect");

console.log("svg", svg);
console.log("select", select);
console.log("selectAll", selectAll);

const addText = d3.selectAll("rect").append("p");
console.log("test", addText);

// Exercise 1.2 – Load the Data
async function loadData() {
    const data = await d3.json("./data/going_out_in_horsens_kw.json");
    // Create an array with all formatted data using flatMap()
    const formattedData = data.flatMap(formatDatum);

    console.log("Google Trends data:", data);
    console.log("First row:", data[0]);
    console.log("Formatted First Row:", formatDatum(data[0]));
    console.log("Formatted Dataset:", formattedData);

    // Exercise 1.4 – Measure the Data
    // a) Group the data by type
    const groupedData = d3.groups(
        formattedData,
        datum => datum.type
    );
    console.log("Grouped Data:", groupedData);

    // b) Inspect each type
    groupedData.forEach((values, type) => {
    console.log(type, values);
    });

    //c) Minimum, maximum, and count
    
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
