import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

async function loadData(file) {
    let data = await d3.csv(file, (d) => {
        d.time_elapsed = parseFloat(d.time_elapsed);
        d.bvp = parseFloat(d.bvp);
        return d;
    });
    return data;
}

function updateChart(data) {

    const svgWidth = 800;
    const svgHeight = 400;
    const margin = { top: 50, right: 50, bottom: 75, left: 100 };

    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const baselineData = data.filter((d) => d.baseline_cog === "baseline");
    const cogData = data.filter((d) => d.baseline_cog === "cog");

    const svg = d3.select("#bvp-variance-line-chart");
    svg.selectAll("*").remove();

    const xScale = d3.scaleLinear().domain([0, 120]).range([0, width]);
    const yScale = d3
      .scaleLinear()
      .domain([d3.min(data, (d) => d.bvp) - 0.5, d3.max(data, (d) => d.bvp) + 10])
      .range([300, 0]);

    const lineBaseline = d3
      .line()
      .defined((d) => !isNaN(d.bvp))
      .x((d) => xScale(d.time_elapsed))
      .y((d) => yScale(d.bvp));

    const lineCog = d3
      .line()
      .defined((d) => !isNaN(d.bvp))
      .x((d) => xScale(d.time_elapsed))
      .y((d) => yScale(d.bvp));

    const chartGroup = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);;

    const cogPath = chartGroup
      .append("path")
      .datum(cogData)
      .attr("d", lineCog)
      .attr("fill", "none")
      .attr("stroke", "#FFA500")
      .attr("stroke-width", 3);
    
    const baselinePath = chartGroup
      .append("path")
      .datum(baselineData)
      .attr("d", lineBaseline)
      .attr("fill", "none")
      .attr("stroke", "#808080")
      .attr("stroke-width", 3);
    
    const xAxis = d3.axisBottom(xScale).tickSize(7);
    const yAxis = d3.axisLeft(yScale).tickSize(7);

    chartGroup
      .append("g")
      .attr("transform", `translate(0, 300)`)
      .call(xAxis)
      .selectAll("text")
      .style("font-family", "'Merriweather'")
      .style("font-size", "15px");
    
    chartGroup
      .append("g")
      .call(yAxis)
      .selectAll("text")
      .style("font-family", "'Merriweather'")
      .style("font-size", "15px");
    
    chartGroup
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + 65)
      .attr("text-anchor", "middle")
      .style("font-family", "'Merriweather'")
      .style("font-size", "16px")
      .text("Time Elapsed (seconds)");

    chartGroup
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -60)
      .attr("text-anchor", "middle")
      .style("font-family", "'Merriweather'")
      .style("font-size", "16px")
      .text("Variance in Blood Volume Pulse");
    
    svg
      .append("text")
      .attr("x", svgWidth / 1.9)
      .attr("y", height - 250)
      .attr("text-anchor", "middle")
      .style("font-family", "'Merriweather'")
      .style("font-size", "24px")
      .style("font-weight", "bolder")
      .text("How Does the Variance of BVP Differ When the Brain is at Rest");
    
      svg
      .append("text")
      .attr("x", svgWidth / 1.9)
      .attr("y", height - 227)
      .attr("text-anchor", "middle")
      .style("font-family", "'Merriweather'")
      .style("font-size", "24px")
      .style("font-weight", "bolder")
      .text("Compared to When the Brain is Under Cognitive Load?");
    
    const legend = svg.append("g").attr("transform", "translate(800, 90)");

    const cogCircle = legend
        .append("circle")
        .attr("cx", -25)
        .attr("cy", 36)
        .attr("r", 6)
        .attr("fill", "#FFA500")
        .style("cursor", "pointer")
        .on("click", function() {
            cogPath.raise();
            d3.select(this).attr("r", 9);
            baselineCircle.attr("r", 6);
        });
  
    legend
        .append("text")
        .attr("x", -10)
        .attr("y", 40)
        .text("Cognitive Load")
        .style("font-family", "'Merriweather'")
        .style("font-size", "13px");
  
    const legend2 = svg.append("g").attr("transform", "translate(800, 115)");
  
    const baselineCircle = legend2
        .append("circle")
        .attr("cx", -25)
        .attr("cy", 33)
        .attr("r", 6)
        .attr("fill", "#808080")
        .style("cursor", "pointer")
        .on("click", function() {
            baselinePath.raise();
            d3.select(this).attr("r", 9);
            cogCircle.attr("r", 6);
        });
  
    legend2
        .append("text")
        .attr("x", -10)
        .attr("y", 37)
        .text("Baseline")
        .style("font-family", "'Merriweather'")
        .style("font-size", "13px");
  
    const legendTitle = svg
        .append("g")
        .attr("transform", "translate(800, 105)");
  
    legendTitle
        .append("text")
        .attr("x", -40)
        .attr("y", 5)
        .text("Cognitive State")
        .style("font-weight", "bold")
        .style("font-family", "'Merriweather'")
        .style("font-size", "15px");

    // Tooltip and vertical line
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("visibility", "hidden")
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px");

    const verticalLine = chartGroup.append("line")
        .attr("class", "vertical-line")
        .attr("y1", 0)
        .attr("y2", height + 25)
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "4")
        .style("visibility", "hidden");
    
        chartGroup.append("rect")
        .attr("width", width)
        .attr("height", height + 25)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mousemove", function(event) {
            const mouseX = d3.pointer(event, this)[0];
            const x0 = xScale.invert(mouseX);
            const i = d3.bisector(d => d.time_elapsed).left;
            const closestBaselineIndex = i(baselineData, x0);
            const closestCogIndex = i(cogData, x0);

            const closestBaseline = baselineData[closestBaselineIndex];
            const closestCog = cogData[closestCogIndex];

            const closestTime = closestBaseline.time_elapsed;

            verticalLine
                .attr("x1", xScale(closestTime))
                .attr("x2", xScale(closestTime))
                .style("visibility", "visible");

            tooltip
                .html(`Seconds Elapsed: ${closestTime}<br>Baseline Var: ${closestBaseline.bvp.toFixed(2)}<br>Cognitive Load Var: ${closestCog.bvp.toFixed(2)}`)
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 28}px`)
                .style("visibility", "visible");
        })
        .on("mouseout", function() {
            verticalLine.style("visibility", "hidden");
            tooltip.style("visibility", "hidden");
        });
}

async function main() {
    const dropdown = document.querySelector("#bvp-variance-grouping select");

    async function handleDropdownChange() {
        const grouping = dropdown.value;
        let file;
        if (grouping === "half_second_var") {
            file = "./data/bvp_variance_line_data/bvp_var_by_half_second.csv";
        } else if (grouping === "tenth_second_var") {
            file = "./data/bvp_variance_line_data/bvp_var_by_tenth_second.csv";
        } else if (grouping === "second_var") {
            file = "./data/bvp_variance_line_data/bvp_var_by_second.csv";
        }
    const data = await loadData(file);
    updateChart(data);
    }

    dropdown.addEventListener("change", handleDropdownChange);

    // Initial chart rendering
    await handleDropdownChange();
}

main();