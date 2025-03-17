import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";


async function loadData() {
    let data = await d3.csv("./data/swarm_data/combined_stats_2_min.csv", (d) => {
        d.time_elapsed = parseFloat(d.time_elapsed);
        d.temp = parseFloat(d.temp);
        d.eda = parseFloat(d.eda);
        d.gamified_or_no = d.gamified_or_no;
        return d;
    });
    console.log(data);
    return data;
}


function updateChart(data, maxTimeElapsed, selectedColors) {
    const svgWidth = 750;
    const svgHeight = 400;
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };


    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;


    const svg = d3.select("#swarm-chart")
        .attr("width", svgWidth)
        .attr("height", svgHeight);


    let chartGroup = svg.select("g");
   
    // If chartGroup doesn't exist, create it
    if (chartGroup.empty()) {
            chartGroup = svg.append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);
    }


    // Define x and y scales
    let sectors = ["Gamified", "Non-Gamified"]//Array.from(new Set(data.map((d) => d.gamified_or_no)));
    let xScale = d3.scalePoint()
        .domain(sectors)
        .range([100, width - 100])
        .padding(0.5);


    let yScale = d3.scaleLinear()
        .domain([0, d3.max(data, (d) => d.eda) + 0.5])
        .range([height, 0]);
   
    let colorScale = d3.scaleQuantize()
        .domain([d3.min(data, d => d.temp), d3.max(data, d => d.temp)])
        .range(["#4575B4", "#91C3E6", "#deb6ab", "#F1957A", "#D73027"]);
   
    let filteredData = data;


    // If selectedColors is provided, filter the data based on the selected colors
    if (selectedColors && selectedColors.size > 0) {
        filteredData = data.filter(d => selectedColors.has(colorScale(d.temp)));
    } else {
        filteredData = [];
    }


    // Remove only old circles, not everything
    svg.selectAll(".circ").remove();


    // Clear existing axes
    chartGroup.selectAll("g").remove();
    chartGroup.selectAll(".axis").remove();
    svg.selectAll(".legend").remove(); // Remove old legend
    svg.selectAll("text").remove();
    chartGroup.selectAll("text").remove(); // Remove old text


    // Draw axes
    chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .style("font-family", "'Merriweather'")
        .style("font-size", "15px");


    chartGroup.append("g")
        .attr("transform", `translate(100, 0)`)
        .call(d3.axisLeft(yScale))
        .selectAll("text")
        .style("font-family", "'Merriweather'")
        .style("font-size", "15px");
   
    chartGroup
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 50)
        .attr("text-anchor", "middle")
        .style("font-family", "'Merriweather'")
        .style("font-size", "16px")
        .text("Electrodermal Activity (EDA)");
   
    chartGroup
        .append("text")
        .attr("x", width / 2)
        .attr("y", height + 45)
        .attr("text-anchor", "middle")
        .style("font-family", "'Merriweather'")
        .style("font-size", "16px")
        .text("Type of Cognitive Task");
   
    svg
        .append("text")
        .attr("x", svgWidth / 1.9)
        .attr("y", height - 275)
        .attr("text-anchor", "middle")
        .style("font-family", "'Merriweather'")
        .style("font-size", "24px")
        .style("font-weight", "bolder")
        .text("Physical Response to Gamified vs. Non-Gamified Cognitive Tasks");


    // Bind data to circles and update accordingly
    let circles = chartGroup.selectAll(".circ")
        .data(filteredData, d => d.time_elapsed);


    // EXIT: Remove circles that are no longer in the data
    circles.exit().remove();


    // ENTER: Append new circles for new data points
    let enterCircles = circles.enter()
        .append("circle")
        .attr("class", "circ")
        .attr("stroke", "black")
        .attr("r", 5)
        .attr("opacity", 0.7);
   
    // UPDATE: Apply new attributes to all circles (both new and existing)
    circles = enterCircles.merge(circles)
        .attr("fill", d => colorScale(d.temp));


    // Create swarm simulation
    let simulation = d3.forceSimulation(filteredData)
        .force("x", d3.forceX(d => xScale(d.gamified_or_no === "gamified" ? "Gamified" : "Non-Gamified")))  // Keep points in x categories
        .force("y", d3.forceY(d => yScale(d.eda)))             // Keep points at the right height
        .force("collide", d3.forceCollide(6))                  // Avoid overlap
        .on("tick", () => {
            circles.attr("cx", d => d.x)
                   .attr("cy", d => d.y);
        });


    simulation.alpha(1).restart();  // Ensure simulation starts with full energy


    // Add legend
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width + margin.right - 150}, ${margin.top})`);


        const colors = ["#D73027", "#F1957A", "#deb6ab", "#91C3E6", "#4575B4"];
        colors.forEach((color, i) => {
            legend.append("rect")
                .attr("x", 40)
                .attr("y", 50 + i * 30)
                .attr("width", 40)
                .attr("height", 30)
                .attr("fill", color)
                .attr("opacity", 0.7)
                .attr("stroke", selectedColors.has(color) ? "black" : "none")  // Add stroke if selected
                .attr("stroke-width", selectedColors.has(color) ? 2 : 0)  // Adjust stroke width if selected
                .on("click", function() {
                    if (selectedColors.has(color)) {
                        selectedColors.delete(color);
                    } else {
                        selectedColors.add(color);
                    }
                    updateChart(data, maxTimeElapsed, selectedColors);
                });
        });
   
    legend.append("text")
        .attr("x", 90)
        .attr("y", 65)
        .style("font-family", "'Merriweather'")
        .style("font-size", "14px")
        .text("High Temperatures");
   
    legend.append("text")
        .attr("x", 90)
        .attr("y", 190)
        .style("font-family", "'Merriweather'")
        .style("font-size", "14px")
        .text("Low Temperatures");
   
    // Add tooltip
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("visibility", "hidden");


    circles.on("mouseover", function(event, d) {
            tooltip.style("visibility", "visible")
                .html(`EDA: ${d.eda.toFixed(2)}<br>Temperature: ${d.temp.toFixed(2)} °C`);
        })
        .on("mousemove", function(event) {
            tooltip.style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 28}px`);
        })
        .on("mouseout", function() {
            tooltip.style("visibility", "hidden");
        });
}


async function main() {
    const data = await loadData();
    const selectedColors = new Set(["#D73027", "#F1957A", "#deb6ab", "#91C3E6", "#4575B4"]);  // Start with all colors selected
    updateChart(data, 120, selectedColors);
}


main();
