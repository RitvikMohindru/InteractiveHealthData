import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

async function loadData() {
    let data = await d3.csv("./data/swarm_data/original_combined_stats_1_min.csv", (d) => {
        d.time_elapsed = parseFloat(d.time_elapsed);
        d.temp = parseFloat(d.temp);
        d.eda = parseFloat(d.eda);
        d.gamified_or_no = d.gamified_or_no;
        return d;
    });
    console.log("Loaded Data: ", data.slice(0, 5));
    return data;
}

function updateChart(data){
    const svgWidth = 750;
    const svgHeight = 400;
    const margin = { top: 50, right: 135, bottom: 80, left: 110 };
    
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;
    
    const svg = d3.select("#swarm-chart")
        .attr("width", svgWidth)
        .attr("height", svgHeight);
    
    svg.selectAll("*").remove();

    const gamifiedData = data.filter((d) => d.gamified_or_no === "gamified");
    const nongamifiedData = data.filter((d) => d.gamified_or_no === "non_gamified");

    const xScale = d3.scaleLinear().domain([0, 60]).range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.eda) + 0.5])
      .range([height, 0]);
    
    let colorScale = d3.scaleQuantize()
            .domain([d3.min(data, d => d.temp), d3.max(data, d => d.temp)])
            .range(["#4575B4", "#91C3E6", "#deb6ab", "#F1957A", "#D73027"]);

    const lineGamified = d3
      .line()
      .defined((d) => !isNaN(d.eda))
      .x((d) => xScale(d.time_elapsed))
      .y((d) => yScale(d.eda));

    const lineNonGamified = d3
      .line()
      .defined((d) => !isNaN(d.eda))
      .x((d) => xScale(d.time_elapsed))
      .y((d) => yScale(d.eda));

    const chartGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    chartGroup
      .append("path")
      .datum(gamifiedData)
      .attr("d", lineGamified)
      .attr("fill", "none")
      .attr("stroke", "#808080")
      .attr("stroke-width", 2);

    chartGroup
      .append("path")
      .datum(nongamifiedData)
      .attr("d", lineNonGamified)
      .attr("fill", "none")
      .attr("stroke", "#808080")
      .attr("stroke-width", 2);

    // Filter data to keep only every other point
    const filteredGamifiedData = gamifiedData.filter((d, i) => i % 2 === 0);
    const filteredNongamifiedData = nongamifiedData.filter((d, i) => i % 2 === 0);

    chartGroup
      .selectAll("circle.gamified")
      .data(filteredGamifiedData)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.time_elapsed))
      .attr("cy", (d) => yScale(d.eda))
      .attr("r", 4)
      .attr("fill", (d) => colorScale(d.temp));

    chartGroup
      .selectAll("circle.nongamified")
      .data(filteredNongamifiedData)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.time_elapsed))
      .attr("cy", (d) => yScale(d.eda))
      .attr("r", 4)
      .attr("fill", (d) => colorScale(d.temp));

    const xAxis = d3.axisBottom(xScale).tickSize(7);
    const yAxis = d3.axisLeft(yScale).tickSize(7);

    chartGroup
      .append("g")
      .attr("transform", `translate(0, ${height})`)
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
      .attr("y", height + 55)
      .attr("text-anchor", "middle")
      .style("font-family", "'Merriweather'")
      .style("font-size", "16px")
      .text("Time (seconds)");

    chartGroup
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -50)
      .attr("text-anchor", "middle")
      .style("font-family", "'Merriweather'")
      .style("font-size", "16px")
      .text("Electrodermal Activity (EDA)");

    svg
      .append("text")
      .attr("x", svgWidth / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font-family", "'Merriweather'")
      .style("font-size", "24px")
      .style("font-weight", "bolder")
      .text("Physical Response to Gamified vs. Non-Gamified Cognitive Tasks");

    const legend = svg.append("g").attr("transform", "translate(685, 90)");

    legend
      .append("text")
      .attr("x", -65)
      .attr("y", 45)
      .text("Gamified")
      .style("font-family", "'Merriweather'")
      .style("font-size", "14px");

    const legend2 = svg.append("g").attr("transform", "translate(685, 115)");

    legend2
      .append("text")
      .attr("x", -65)
      .attr("y", 120)
      .text("Non-Gamified")
      .style("font-family", "'Merriweather'")
      .style("font-size", "14px");
    
    // Add legend
    const legend3 = svg.append("g")
        .attr("transform", `translate(${width + margin.right + 110}, ${margin.top + 30})`);

        const colors = ["#D73027", "#F1957A", "#deb6ab", "#91C3E6", "#4575B4"];
        colors.forEach((color, i) => {
            legend3.append("rect")
                .attr("x", -35)
                .attr("y", 50 + i * 20)
                .attr("width", 20)
                .attr("height", 20)
                .attr("fill", color)
                .attr("opacity", 0.7);
        });
   
    legend3.append("text")
        .attr("x", -40)
        .attr("y", 45)
        .style("font-family", "'Merriweather'")
        .style("font-size", "14px")
        .text("High");
   
    legend3.append("text")
        .attr("x", -40)
        .attr("y", 165)
        .style("font-family", "'Merriweather'")
        .style("font-size", "14px")
        .text("Low");
    
    legend3.append("text")
        legend3.append("text")
        .attr("transform", "rotate(90)")
        .attr("x", 50)
        .attr("y", 10)
        .style("font-family", "'Merriweather'")
        .style("font-size", "14px")
        .text("Temperature (°C)");

    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "rgba(199, 194, 194, 0.8)")
      .style("color", "black")
      .style("padding", "8px")
      .style("border-radius", "5px")
      .style("font-size", "12px")
      .style("visibility", "hidden");

    const verticalLine = chartGroup
      .append("line")
      .attr("stroke", "#5B5B5B")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "5 10")
      .attr("y1", 0)
      .attr("y2", height)
      .style("visibility", "hidden");

    svg
      .on("mousemove", (event) => {
        const [mouseX] = d3.pointer(event);
        const x0 = xScale.invert(mouseX - margin.left);
        const closestTime = Math.round(x0);

        const gamifiedPoint = filteredGamifiedData.find(
          (d) => d.time_elapsed === closestTime
        );
        const nongamifiedPoint = filteredNongamifiedData.find(
          (d) => d.time_elapsed === closestTime
        );

        chartGroup.selectAll("circle").attr("r", 4);

        if (gamifiedPoint !== undefined && nongamifiedPoint !== undefined) {
          verticalLine
            .attr("x1", xScale(closestTime))
            .attr("x2", xScale(closestTime))
            .style("visibility", "visible");

          tooltip
            .style("visibility", "visible")
            .html(
              `Time: ${closestTime} Seconds<br>Gamified EDA: ${gamifiedPoint.eda.toFixed(
                2
              )}<br>Gamified Temp: ${gamifiedPoint.temp.toFixed(
                2
              )}<br>Non-Gamified EDA: ${nongamifiedPoint.eda.toFixed(
                2
              )}<br>Non-Gamified Temp: ${nongamifiedPoint.temp.toFixed(2)}`
            )
            .style("top", `${event.pageY - 30}px`)
            .style("left", `${event.pageX + 10}px`);

          chartGroup
            .selectAll("circle")
            .filter((d) => d.time_elapsed === closestTime)
            .attr("r", 8);
        } else {
          verticalLine.style("visibility", "visible");
          tooltip
            .style("visibility", "visible")
            .html(`Time: ${closestTime} Seconds<br>Gamified EDA: ${gamifiedPoint.eda.toFixed(
                2
              )}<br>Gamified Temp: ${gamifiedPoint.temp.toFixed(
                2
              )}<br>Non-Gamified EDA: ${nongamifiedPoint.eda.toFixed(
                2
              )}<br>Non-Gamified Temp: ${nongamifiedPoint.temp.toFixed(2)}`)
            .style("top", `${event.pageY - 30}px`)
            .style("left", `${event.pageX + 10}px`);
        }
      })
      .on("mouseout", () => {
        verticalLine.style("visibility", "hidden");
        tooltip.style("visibility", "hidden");
      })
      .on("mouseover", () => {
        tooltip.style("visibility", "visible");
      });
}

async function main() {
    const data = await loadData();
    console.log("Data Loaded: ", data.slice(0, 5));
    updateChart(data);
}

main();
