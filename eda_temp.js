import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

async function loadData() {
  let data = await d3.csv(
    "./data/swarm_data/original_combined_stats_1_min.csv",
    (d) => {
      d.time_elapsed = parseFloat(d.time_elapsed);
      d.temp = parseFloat(d.temp);
      d.eda = parseFloat(d.eda);
      d.gamified_or_no = d.gamified_or_no;
      return d;
    }
  );
  console.log("Loaded Data: ", data.slice(0, 5));
  return data;
}

function updateChart(data) {
  const svgWidth = 750;
  const svgHeight = 400;
  const margin = { top: 50, right: 135, bottom: 80, left: 70 };

  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;

  const svg = d3
    .select("#swarm-chart")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  svg.selectAll("*").remove();

  const gamifiedData = data.filter((d) => d.gamified_or_no === "gamified");
  const nongamifiedData = data.filter(
    (d) => d.gamified_or_no === "non_gamified"
  );

  const xScale = d3
    .scaleLinear()
    .domain([0, 60])
    .range([0, width - 70]);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.eda) + 0.5])
    .range([height, 0]);

  let colorScale = d3
    .scaleQuantize()
    .domain([d3.min(data, (d) => d.temp), d3.max(data, (d) => d.temp)])
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
    .attr("x", svgWidth / 2.1)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .style("font-family", "'Merriweather'")
    .style("font-size", "24px")
    .style("font-weight", "bolder")
    .text("Physical Response to Gamified vs. Non-Gamified Cognitive Tasks");

  const legend = svg.append("g").attr("transform", "translate(685, 90)");

  legend
    .append("text")
    .attr("x", -135)
    .attr("y", 45)
    .text("Gamified")
    .style("font-family", "'Merriweather'")
    .style("font-size", "14px");

  const legend2 = svg.append("g").attr("transform", "translate(685, 115)");

  legend2
    .append("text")
    .attr("x", -135)
    .attr("y", 120)
    .text("Non-Gamified")
    .style("font-family", "'Merriweather'")
    .style("font-size", "14px");

  // Add legend
  const legend3 = svg
    .append("g")
    .attr(
      "transform",
      `translate(${width + margin.right + 10}, ${margin.top + 30})`
    );

  const colors = ["#D73027", "#F1957A", "#deb6ab", "#91C3E6", "#4575B4"];
  colors.forEach((color, i) => {
    legend3
      .append("rect")
      .attr("x", -35)
      .attr("y", 50 + i * 20)
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", color)
      .attr("opacity", 0.7);
  });

  legend3
    .append("text")
    .attr("x", -40)
    .attr("y", 45)
    .style("font-family", "'Merriweather'")
    .style("font-size", "14px")
    .text("High");

  legend3
    .append("text")
    .attr("x", -40)
    .attr("y", 165)
    .style("font-family", "'Merriweather'")
    .style("font-size", "14px")
    .text("Low");

  legend3.append("text");
  legend3
    .append("text")
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

  chartGroup
    .append("rect") // Invisible overlay for mouse detection
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all") // Enables mouse interactions
    .on("mousemove", (event) => {
      const [mouseX, mouseY] = d3.pointer(event);

      // Ensure mouse is within axes
      if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
        tooltip.style("visibility", "hidden");
        verticalLine.style("visibility", "hidden");
        return;
      }

      const x0 = xScale.invert(mouseX);
      const closestTime = Math.round(x0);

      const gamifiedPoint = filteredGamifiedData.find(
        (d) => d.time_elapsed === closestTime
      );
      const nongamifiedPoint = filteredNongamifiedData.find(
        (d) => d.time_elapsed === closestTime
      );

      chartGroup.selectAll("circle").attr("r", 4);

      if (gamifiedPoint && nongamifiedPoint) {
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
      }
    })
    .on("mouseout", () => {
      verticalLine.style("visibility", "hidden");
      tooltip.style("visibility", "hidden");
    });

  svg.on("mouseleave", () => {
    chartGroup.selectAll("circle").attr("r", 4); // Reset the size of all dots
  });

  document.getElementById("small-slider").step = "1";
  const value = document.querySelector("#chosen-sec");
  const input = document.querySelector("#small-slider");
  value.textContent = input.value;
  input.addEventListener("input", (event) => {
    const sec = event.target.value;
    value.textContent = sec;
    updateSmallChart(sec);
  });

  updateSmallChart(1);
}

function updateSmallChart(sec) {
  d3.csv(`./data/bvp_real.csv`)
    .then((smallData) => {
      smallData.forEach((d) => {
        d.time = parseFloat(d.time_elapsed).toFixed(1);
        d.bvp = parseFloat(d.bvp);
      });

      // Filter data to only include points within the given second
      const filteredData = smallData.filter(
        (d) => d.time >= sec && d.time < sec + 1
      );

      console.log(`Filtered data for sec = ${sec}:`, filteredData); // Debugging log

      const smallWidth = 500;
      const smallHeight = 300;
      const smallMargin = { top: 90, right: 50, bottom: 50, left: 50 };
      const innerWidth = smallWidth - smallMargin.left - smallMargin.right;
      const innerHeight = smallHeight - smallMargin.top - smallMargin.bottom;

      if (filteredData.length === 0) {
        console.warn(`No data found for sec = ${sec}`);
        return;
      }

      const xSmallScale = d3
        .scaleLinear()
        .domain([sec, sec + 1]) // Reset x-axis domain
        .range([0, innerWidth]);

      const ySmallScale = d3
        .scaleLinear()
        .domain([
          d3.min(filteredData, (d) => d.bvp) - 0.5,
          d3.max(filteredData, (d) => d.bvp) + 0.5,
        ])
        .range([innerHeight, -20]);

      const lineSmall = d3
        .line()
        .x((d) => xSmallScale(d.time))
        .y((d) => ySmallScale(d.bvp));

      // Clear previous graph
      d3.select("#bvp-side-chart").select("svg").remove();

      const smallSvg = d3
        .select("#bvp-side-chart")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${smallWidth} ${smallHeight}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

      smallSvg
        .append("text")
        .attr("x", smallWidth / 2)
        .attr("y", smallMargin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-family", "'Merriweather'")
        .style("font-size", "18px")
        .style("font-weight", "bolder")
        .text(`BVP for Second ${sec}`);

      const smallChartGroup = smallSvg
        .append("g")
        .attr(
          "transform",
          `translate(${smallMargin.left}, ${smallMargin.top})`
        );

      const xAxisSmall = d3.axisBottom(xSmallScale).ticks(5).tickSize(7);
      const yAxisSmall = d3.axisLeft(ySmallScale).ticks(5).tickSize(7);

      // Remove old axes before adding new ones
      smallChartGroup.select(".x-axis").remove();
      smallChartGroup.select(".y-axis").remove();

      // Append x-axis
      smallChartGroup
        .append("g")
        .attr("class", "x-axis") // Add a class for easy removal
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(xAxisSmall)
        .selectAll("text")
        .style("font-family", "'Merriweather'");

      // Append y-axis
      smallChartGroup
        .append("g")
        .attr("class", "y-axis") // Add a class for easy removal
        .call(yAxisSmall)
        .selectAll("text")
        .style("font-family", "'Merriweather'");

      // Filter gamified and non-gamified data
      const gamifiedSmallData = filteredData.filter(
        (d) => d.gamified_or_no === "gamified"
      );
      const nongamifiedSmallData = filteredData.filter(
        (d) => d.gamified_or_no === "non_gamified"
      );

      // Append gamified line
      smallChartGroup
        .append("path")
        .datum(gamifiedSmallData)
        .attr("fill", "none")
        .attr("stroke", "#FF7F7F")
        .attr("stroke-width", 2)
        .attr("d", lineSmall);

      // Append non-gamified line
      smallChartGroup
        .append("path")
        .datum(nongamifiedSmallData)
        .attr("fill", "none")
        .attr("stroke", "#808080")
        .attr("stroke-width", 2)
        .attr("d", lineSmall);

      // Axis labels
      smallChartGroup
        .append("text")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 40)
        .attr("text-anchor", "middle")
        .style("font-family", "'Merriweather'")
        .style("font-size", "14px")
        .text("Time (seconds)");

      smallChartGroup
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerHeight / 2)
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .style("font-family", "'Merriweather'")
        .style("font-size", "14px")
        .text("Blood Volume Pulse");
    })
    .catch((error) => console.error(`Error loading CSV:`, error));
}

async function main() {
  const data = await loadData();
  updateChart(data);
  updateSmallChart();
}

main();
