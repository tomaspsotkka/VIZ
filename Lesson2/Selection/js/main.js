// Select the container
const svg = d3.select("#container");

// Select the first path
const select = d3.select("rect");

// Select all paths in the selection
const selectAll = d3.selectAll("rect");

console.log("svg", svg);
console.log("select", select);
console.log("selectAll", selectAll);

// Shared layout + color scale, reused by the legend, the bar chart (2.2)
// and the trend heatmap (2.3) so everything lines up and shares one palette.
const margin = { top: 10, right: 40, bottom: 10, left: 110 };
const chartWidth = 800;

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
            .attr("x", 22)
            .attr("y", 12);

legendGroups.attr("transform", (datum, index) => `translate(${margin.left + index * 150}, 8)`);

// Exercise 1.5 – Bind the Data
// a) bind some dummy data to the <rect> elements of the project
const dummyValues = [10, 45, 25, 60, 30];

const demoScale = d3.scaleLinear()
    .domain([0, d3.max(dummyValues)])
    .range([0, chartWidth - margin.left - margin.right]);

const demoRects = svg.selectAll("rect")
    .data(dummyValues)
    .join("rect")
    .attr("x", margin.left)
    .attr("y", (datum, index) => margin.top + index * 22)
    .attr("width", datum => demoScale(datum))
    .attr("height", 18)
    .attr("fill", "#1f77b4");

// b) print the joined selection to inspect data <-> element binding
console.log("Exercise 1.5 – bound rects:", demoRects.nodes());
console.log("Exercise 1.5 – bound data:", demoRects.data());

// c) scales are already used above (demoScale) to turn values into pixel widths.
// This was only a warm-up, so clear it before the real chart is drawn below.
demoRects.remove();

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

    const groupedByDate = d3.groups(
         formattedData,
         datum => datum.date
    );
    console.log("Grouped by date:", groupedByDate);

    // b) Inspect each type
    groupedData.forEach(([type, values]) => {
        console.log(type, values);
    });

    const firstThreeDates = groupedByDate.slice(0, 3);
    console.log("First 3 dates", firstThreeDates);

    drawBarChart(firstThreeDates);
    drawTrendHeatmap(formattedData, groupedByDate.map(([date]) => date));
}
loadData();

// Exercise 2.1 – Planning the layout
// a) Bars: an xScale (linear, domain = [0, max value], range = [margin.left, width - margin.right])
//    turns each value into a pixel width; every bar starts at xScale(0).
//    A yScale (band, domain = dates) positions one group per date, and a nested
//    ySubScale (band, domain = the 3 types) positions the 3 bars inside that group.
// b) Labels: the date label for a group sits at x = margin.left (in the left
//    margin) and y = the vertical centre of that date's yScale band.
// c) Legend: one <g> per type, each holding a coloured <rect> + a <text>,
//    the groups translated along x so they sit in a row (see legendGroups above).

// Exercise 2.2 – Implementing the layout
function drawBarChart(groupedByDate) {
    const rowHeight = 34; // px per date group, incl. padding
    const innerHeight = groupedByDate.length * rowHeight;
    const height = margin.top + innerHeight + margin.bottom;

    svg.attr("width", chartWidth).attr("height", height);

    const allValues = groupedByDate.flatMap(([date, values]) => values);

    const xScale = d3.scaleLinear()
                    .domain([0, d3.max(allValues, datum => datum.value)])
                    .range([margin.left, chartWidth - margin.right]);

    const yScale = d3.scaleBand()
                    .domain(groupedByDate.map(([date]) => date))
                    .range([margin.top, margin.top + innerHeight])
                    .paddingInner(0.25)
                    .paddingOuter(0.15);

    const ySubScale = d3.scaleBand()
                        .domain(colorScale.domain())
                        .range([0, yScale.bandwidth()])
                        .paddingInner(0.08);

    const formatDate = d3.timeFormat("%b %d");

    const dateGroups = svg.selectAll("g.date-group")
                        .data(groupedByDate)
                        .join("g")
                        .attr("class", "date-group")
                        .attr("transform", ([date]) => `translate(0, ${yScale(date)})`);

    dateGroups.selectAll("rect")
            .data(([date, values]) => values)
            .join("rect")
            .attr("x", xScale(0))
            .attr("y", datum => ySubScale(datum.type))
            .attr("width", datum => xScale(datum.value) - xScale(0))
            .attr("height", ySubScale.bandwidth())
            .attr("fill", datum => colorScale(datum.type));

    dateGroups.selectAll("text")
            .data(([date]) => [date])
            .join("text")
            .text(datum => formatDate(datum))
            .attr("x", margin.left - 10)
            .attr("y", yScale.bandwidth() / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "end")
            .attr("font-size", "9px");
}

// Exercise 2.3 – Discover trends
// A week-by-week grouped bar chart is great for comparing the 3 venue types
// within a single week, but with 53 weeks stacked vertically it's hard to see
// how each type trends over the year. A heatmap (still just <rect>s + scales,
// no new concepts) puts every week side by side on one row per type, so
// spikes/dips (e.g. bars around New Year's Eve, pizza around Christmas)
// jump out immediately as bands of light/dark colour.
function drawTrendHeatmap(formattedData, dates) {
    const width = chartWidth;
    const height = 220;
    const heatMargin = { top: 20, right: 20, bottom: 30, left: 110 };

    const trendSVG = d3.select("#trends").attr("width", width).attr("height", height);

    const xScale = d3.scaleBand()
                    .domain(dates)
                    .range([heatMargin.left, width - heatMargin.right])
                    .padding(0.08);

    const yScale = d3.scaleBand()
                    .domain(colorScale.domain())
                    .range([heatMargin.top, height - heatMargin.bottom])
                    .padding(0.15);

    // opacity encodes the value, hue reuses the same colorScale as the legend/bar chart
    const opacityScale = d3.scaleLinear()
                    .domain([0, d3.max(formattedData, datum => datum.value)])
                    .range([0.08, 1]);

    trendSVG.selectAll("rect")
            .data(formattedData)
            .join("rect")
            .attr("x", datum => xScale(datum.date))
            .attr("y", datum => yScale(datum.type))
            .attr("width", xScale.bandwidth())
            .attr("height", yScale.bandwidth())
            .attr("fill", datum => colorScale(datum.type))
            .attr("fill-opacity", datum => opacityScale(datum.value))
            .append("title")
            .text(datum => `${datum.type}, ${datum.date.toDateString()}: ${datum.value}`);

    // row labels
    trendSVG.selectAll("text.row-label")
            .data(colorScale.domain())
            .join("text")
            .attr("class", "row-label")
            .text(datum => datum)
            .attr("x", heatMargin.left - 10)
            .attr("y", datum => yScale(datum) + yScale.bandwidth() / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "end")
            .attr("font-size", "10px");

    // sparse date ticks along the bottom (every 4th week) to keep it readable
    const formatDate = d3.timeFormat("%b %d");
    const tickDates = dates.filter((date, index) => index % 4 === 0);

    trendSVG.selectAll("text.tick-label")
            .data(tickDates)
            .join("text")
            .attr("class", "tick-label")
            .text(datum => formatDate(datum))
            .attr("x", datum => xScale(datum) + xScale.bandwidth() / 2)
            .attr("y", height - heatMargin.bottom + 14)
            .attr("text-anchor", "middle")
            .attr("font-size", "9px");
}
