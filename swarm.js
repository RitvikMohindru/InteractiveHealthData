import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

async function loadData() {
    let data = await d3.csv("./data/swarm_data/combined_stats_1_min.csv", (d) => {
        d.time_elapsed = parseFloat(d.time_elapsed);
        d.temp = parseFloat(d.temp);
        d.eda = parseFloat(d.eda);
        d.gamified_or_no = d.gamified_or_no;
        return d;
    });
    console.log(data);
    return data;
}

function updateChart(data) {
    const svgWidth = 750;
    const svgHeight = 400;
    const margin = { top: 50, right: 50, bottom: 50, left: 50 };

    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const svg = d3.select("#swarm-chart")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    const chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Define x and y scales
    let sectors = ["Gamified", "Non-Gamified"]//Array.from(new Set(data.map((d) => d.gamified_or_no)));
    let xScale = d3.scalePoint()
        .domain(sectors)
        .range([100, width - 100])
        .padding(0.5);

    let yScale = d3.scaleLinear()
        .domain([d3.min(data, (d) => d.eda) - 0.5, d3.max(data, (d) => d.eda) + 0.5])
        .range([height, 0]);
    
    let colorScale = d3.scaleQuantize()
        .domain([d3.min(data, d => d.temp), d3.max(data, d => d.temp)])
        .range(["#4575B4", "#91C3E6", "#deb6ab", "#F1957A", "#D73027"]);

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

    // Create circles
    let circles = chartGroup.selectAll(".circ")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "circ")
        .attr("stroke", "black")
        .attr("fill", (d) => colorScale(d.temp))
        .attr("r", 5)
        .attr("opacity", 0.7);

    // Create swarm simulation
    let simulation = d3.forceSimulation(data)
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

    legend.append("rect")
        .attr("x", 10)
        .attr("y", 20)
        .attr("width", 20)
        .attr("height", 10)
        .attr("fill", "#D73027")
        .attr("opacity", 0.7);
    
    legend.append("rect")
        .attr("x", 10)
        .attr("y", 30)
        .attr("width", 20)
        .attr("height", 10)
        .attr("fill", "#F1957A")
        .attr("opacity", 0.7);
    
    legend.append("rect")
        .attr("x", 10)
        .attr("y", 40)
        .attr("width", 20)
        .attr("height", 10)
        .attr("fill", "#deb6ab")
        .attr("opacity", 0.7);
    
    legend.append("rect")
        .attr("x", 10)
        .attr("y", 50)
        .attr("width", 20)
        .attr("height", 10)
        .attr("fill", "#91C3E6")
        .attr("opacity", 0.7);

    legend.append("rect")
        .attr("x", 10)
        .attr("y", 60)
        .attr("width", 20)
        .attr("height", 10)
        .attr("fill", "#4575B4")
        .attr("opacity", 0.7);
    
    legend.append("text")
        .attr("x", 40)
        .attr("y", 30)
        .style("font-family", "'Merriweather'")
        .style("font-size", "14px")
        .text("Higher Temperatures");
    
    legend.append("text")
        .attr("x", 40)
        .attr("y", 70)
        .style("font-family", "'Merriweather'")
        .style("font-size", "14px")
        .text("Lower Temperatures");
    
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
    updateChart(data);
}

main();
