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

    const xScale = d3.scaleTime()
    .domain(d3.extent(formattedData, datum => datum.date))
    .range([40, 760]);

    const yScale = d3.scaleLinear()
    .domain([0, d3.max(formattedData, datum => datum.value)])
    .range([460, 40]);

    const rectangles = svg
        .selectAll("rect")
        .data(formattedData)
        .join("rect")
        .attr("x", datum => xScale(datum.date))
        .attr("y", datum => yScale(datum.value))
        .attr("width", 4)
        .attr("height", datum => 460 - yScale(datum.value))
        .attr("fill", "steelblue");

    svg.append("g")
        .attr("transform", "translate(0, 460)")
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .attr("transform", "translate(40, 0)")
        .call(d3.axisLeft(yScale));
    

    console.log("Google Trends data:", data);
    console.log("First row:", data[0]);
    console.log("Formatted First Row:", formatDatum(data[0]));
    console.log("Formatted Dataset:", formattedData);
    console.log("Rectangles", rectangles.data());
    console.table(rectangles.data());

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

    //c) Minimum, maximum, and count
    groupedData.forEach(([type, values]) => {
    const minimum = d3.min(values, datum => datum.value);
    const maximum = d3.max(values, datum => datum.value);
    const count = values.length;
    
    console.log(`Statistics for ${type}`, {
        minimum,
        maximum,
        count
    });

    //d) First and last date
    const firstDate = d3.min(formattedData, datum => datum.date);
    const lastDate = d3.max(formattedData, datum => datum.date);

    console.log("First Date:", firstDate);
    console.log("Last Date:", lastDate);

    //e) More d3-array functions
    const mean = d3.mean(values, datum => datum.value);
    const median = d3.median(values, datum => datum.value);
    const sum = d3.sum(values, datum => datum.value);
    const extent = d3.extent(values, datum => datum.value);
    
    console.log("Mean:", mean)
    console.log("Median:", median)
    console.log("Sum:", sum)
    console.log("Extent:", extent)
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
