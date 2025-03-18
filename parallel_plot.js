import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let gamified_data = [];
let non_gamified_data = [];

async function loadData() {
  gamified_data = await d3.csv(
    "./data/pcp_data/original_gamified_stats_by_second.csv",
    (d) => {
      d.time_elapsed = parseFloat(d.time_elapsed);
      d.bvp = parseFloat(d.bvp);
      d.eda = parseFloat(d.eda);
      d.temp = parseFloat(d.temp);
      return d;
    }
  );

  non_gamified_data = await d3.csv(
    "./data/pcp_data/original_non_gamified_stats_by_second.csv",
    (d) => {
      d.time_elapsed = parseFloat(d.time_elapsed);
      d.bvp = parseFloat(d.bvp);
      d.eda = parseFloat(d.eda);
      d.temp = parseFloat(d.temp);
      return d;
    }
  );
}

const margin = { top: 30, right: 150, bottom: 30, left: 150 };
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

const features = ["bvp", "eda", "temp"];

let svg = d3
  .select("#parallel-coordinate-plot")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

async function drawParallelCoordinatePlot() {
  await loadData();

  const xScale = d3.scalePoint().domain(features).range([0, width]);

  const yScale = {};
  features.forEach((feature) => {
    const minVal = d3.min(
      gamified_data.concat(non_gamified_data),
      (d) => d[feature]
    );
    const maxVal = d3.max(
      gamified_data.concat(non_gamified_data),
      (d) => d[feature]
    );
    const padding = (maxVal - minVal) * 0.05;
    yScale[feature] = d3
      .scaleLinear()
      .domain([minVal - padding, maxVal + padding])
      .range([height, 0]);
  });

  // Create axes
  const axes = svg
    .selectAll(".axis")
    .data(features)
    .enter()
    .append("g")
    .attr("class", "axis")
    .attr("transform", (d) => `translate(${xScale(d)})`)
    .each(function (d) {
      d3.select(this).call(d3.axisLeft(yScale[d]));
    });

  svg
    .selectAll(".axis-label")
    .data(features)
    .enter()
    .append("text")
    .attr("class", "axis-label")
    .attr("x", (d) => xScale(d))
    .attr("y", -10)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text((d) => d.toUpperCase());

  svg
    .selectAll(".gamified-line")
    .data(gamified_data)
    .enter()
    .append("path")
    .attr("class", "gamified-line")
    .attr("d", (d) => lineGenerator(d, features, xScale, yScale))
    .attr("fill", "none")
    .attr("stroke", "darkorange")
    .attr("stroke-width", 3)
    .attr("opacity", 0.7);

  svg
    .selectAll(".non-gamified-line")
    .data(non_gamified_data)
    .enter()
    .append("path")
    .attr("class", "non-gamified-line")
    .attr("d", (d) => lineGenerator(d, features, xScale, yScale))
    .attr("fill", "none")
    .attr("stroke", "gray")
    .attr("stroke-width", 3)
    .attr("opacity", 0.7);

  const legend = svg
    .append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width + 25}, 0)`);

  legend
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", "darkorange")
    .attr("opacity", 0.8)
    .attr("rx", 5)
    .attr("ry", 5);

  legend
    .append("text")
    .attr("x", 30)
    .attr("y", 10)
    .text("Gamified")
    .style("font-size", "14px")
    .attr("alignment-baseline", "middle");

  legend
    .append("rect")
    .attr("x", 0)
    .attr("y", 30)
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", "gray")
    .attr("opacity", 0.8)
    .attr("rx", 5)
    .attr("ry", 5);

  legend
    .append("text")
    .attr("x", 30)
    .attr("y", 40)
    .text("Non-Gamified")
    .style("font-size", "14px")
    .attr("alignment-baseline", "middle");

  document.getElementById("slider").value = 1;
  const value = document.querySelector("#sec-num");
  const input = document.querySelector("#slider");
  value.textContent = input.value;

  const gamifiedDataPoint = getDataPointByTimeElapsed(1, gamified_data);
  const nonGamifiedDataPoint = getDataPointByTimeElapsed(1, non_gamified_data);

  updateLines(gamifiedDataPoint, nonGamifiedDataPoint);

  input.addEventListener("input", (event) => {
    const second = parseInt(event.target.value, 10);
    value.textContent = second;
    const gamifiedDataPoint = getDataPointByTimeElapsed(second, gamified_data);
    const nonGamifiedDataPoint = getDataPointByTimeElapsed(
      second,
      non_gamified_data
    );
    updateLines(gamifiedDataPoint, nonGamifiedDataPoint);
  });

  function updateLines(gamifiedDataPoint, nonGamifiedDataPoint) {
    const transition = d3.transition().duration(50);

    // Update gamified line and markers
    svg
      .selectAll(".gamified-line")
      .datum(gamifiedDataPoint)
      .transition(transition)
      .attr("d", (d) => lineGenerator(d, features, xScale, yScale));

    svg
      .selectAll(".gamified-marker")
      .data(features)
      .join("circle")
      .attr("class", "gamified-marker")
      .transition(transition)
      .attr("cx", (d) => xScale(d))
      .attr("cy", (d) => yScale[d](gamifiedDataPoint[d]))
      .attr("r", 5)
      .attr("fill", "darkorange");

    // Update non-gamified line and markers
    svg
      .selectAll(".non-gamified-line")
      .datum(nonGamifiedDataPoint)
      .transition(transition)
      .attr("d", (d) => lineGenerator(d, features, xScale, yScale));

    svg
      .selectAll(".non-gamified-marker")
      .data(features)
      .join("circle")
      .attr("class", "non-gamified-marker")
      .transition(transition)
      .attr("cx", (d) => xScale(d))
      .attr("cy", (d) => yScale[d](nonGamifiedDataPoint[d]))
      .attr("r", 5)
      .attr("fill", "gray");
  }
}

function lineGenerator(dataPoint, features, xScale, yScale) {
  return d3.line()(
    features.map(function (feature) {
      return [xScale(feature), yScale[feature](dataPoint[feature])];
    })
  );
}

function getDataPointByTimeElapsed(second, data) {
  return data.filter((d) => d.time_elapsed === second)[0];
}

drawParallelCoordinatePlot();
