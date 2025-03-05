import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let gamified_data = []; // Global variable to store the gamified data
let non_gamified_data = []; // Global variable to store the non-gamified data

async function loadData() {
  // Load the gamified data
  gamified_data = await d3.csv(
    "./radar_data/gamified_stats_by_second.csv",
    (d) => {
      d.time_elapsed = parseFloat(d.time_elapsed);
      d.bvp = parseFloat(d.bvp);
      d.eda = parseFloat(d.eda);
      d.temp = parseFloat(d.temp);
      return d;
    }
  );
  console.log("Loaded Gamified Data:", gamified_data);

  // Load the non-gamified data
  non_gamified_data = await d3.csv(
    "./radar_data/non_gamified_stats_by_second.csv",
    (d) => {
      d.time_elapsed = parseFloat(d.time_elapsed);
      d.bvp = parseFloat(d.bvp);
      d.eda = parseFloat(d.eda);
      d.temp = parseFloat(d.temp);
      return d;
    }
  );
  console.log("Loaded Non-Gamified Data:", non_gamified_data);
}

const width = 500;
const height = 500;

let svg = d3.select("#radar-chart");

// Scale for the radius
const rScale = d3.scaleLinear().range([0, 200]).domain([0, 1]);
let ticks = [0.2, 0.4, 0.6, 0.8, 1];
let features = ["bvp", "eda", "temp"];

async function drawRadarChart() {
  // wait for the data to be loaded
  await loadData();

  //Draw the background circles
  svg
    .selectAll("circle")
    .data(ticks)
    .join((enter) =>
      enter
        .append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("fill", "none")
        .attr("stroke", "gray")
        .attr("r", (d) => rScale(d))
    );

  // Add labels for each circle
  svg
    .selectAll(".ticklabel")
    .data(ticks)
    .join((enter) =>
      enter
        .append("text")
        .attr("class", "ticklabel")
        .attr("x", width / 2 + 5)
        .attr("y", (d) => height / 2.03 - rScale(d))
        .text((d) => d.toString())
    );

  let featureData = features.map((f, i) => {
    let angle = Math.PI / 2 + (2 * Math.PI * i) / features.length;
    return {
      name: f,
      angle: angle,
      line_coord: angleToCoordinate(angle, 1),
      label_coord: angleToCoordinate(angle, 1.14),
    };
  });

  // draw axis lines
  svg
    .selectAll("line")
    .data(featureData)
    .join((enter) =>
      enter
        .append("line")
        .attr("x1", width / 2)
        .attr("y1", height / 2)
        .attr("x2", (d) => d.line_coord.x)
        .attr("y2", (d) => d.line_coord.y)
        .attr("stroke", "black")
    );

  // draw axis labels
  svg
    .selectAll(".axislabel")
    .data(featureData)
    .join((enter) =>
      enter
        .append("text")
        .attr("x", (d) => d.label_coord.x)
        .attr("y", (d) => d.label_coord.y)
        .text((d) => d.name)
    );

  let line = d3
    .line()
    .x((d) => d.x)
    .y((d) => d.y);

  // draw the path element for non gamified data
  svg
    .selectAll(".non-gamified-path")
    .data([non_gamified_data[0]])
    .join((enter) =>
      enter
        .append("path")
        .attr("class", "non-gamified-path")
        .datum((d) => getPathCoordinates(d))
        .attr("d", line)
        .attr("stroke-width", 3)
        .attr("stroke", "gray")
        .attr("fill", "gray")
        .attr("stroke-opacity", 1)
        .attr("opacity", 0.5)
    );

  // draw the path element for gamified data
  svg
    .selectAll(".gamified-path")
    .data([gamified_data[0]])
    .join((enter) =>
      enter
        .append("path")
        .attr("class", "gamified-path")
        .datum((d) => getPathCoordinates(d))
        .attr("d", line)
        .attr("stroke-width", 3)
        .attr("stroke", "darkorange")
        .attr("fill", "darkorange")
        .attr("stroke-opacity", 1)
        .attr("opacity", 0.5)
    );

  // Add legend
  const legend = svg
    .append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width - 130}, 20)`);

  legend
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", "darkorange")
    .attr("opacity", 0.7);

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
    .attr("opacity", 0.7);

  legend
    .append("text")
    .attr("x", 30)
    .attr("y", 40)
    .text("Non-Gamified")
    .style("font-size", "14px")
    .attr("alignment-baseline", "middle");

  document.getElementById("slider").step = "1";
  const value = document.querySelector("#sec-num");
  const input = document.querySelector("#slider");
  value.textContent = input.value;
  input.addEventListener("input", (event) => {
    const second = parseInt(event.target.value, 10);
    value.textContent = second;
    const gamifiedDataPoint = getDataPointByTimeElapsed(second, gamified_data);
    const nonGamifiedDataPoint = getDataPointByTimeElapsed(
      second,
      non_gamified_data
    );
    updateShapes(gamifiedDataPoint, nonGamifiedDataPoint);
  });

  // Function to update the shapes with smooth transitions
  function updateShapes(gamifiedDataPoint, nonGamifiedDataPoint) {
    svg
      .selectAll(".gamified-path")
      .datum(gamifiedDataPoint)
      .transition()
      .duration(100)
      .attr("d", line(getPathCoordinates(gamifiedDataPoint)));

    svg
      .selectAll(".non-gamified-path")
      .datum(nonGamifiedDataPoint)
      .transition()
      .duration(100)
      .attr("d", line(getPathCoordinates(nonGamifiedDataPoint)));
  }
}

drawRadarChart();

// Function to get the data point where time_elapsed equals the slider value
function getDataPointByTimeElapsed(index, data) {
  return data[index - 1];
}

// Function maps polar coordinates to svg coordinates
function angleToCoordinate(angle, value) {
  let x = Math.cos(angle) * rScale(value);
  let y = Math.sin(angle) * rScale(value);
  return { x: width / 2 + x, y: height / 2 - y };
}

function getPathCoordinates(data_point) {
  let coordinates = [];
  for (var i = 0; i < features.length; i++) {
    let ft_name = features[i];
    let angle = Math.PI / 2 + (2 * Math.PI * i) / features.length;
    coordinates.push(angleToCoordinate(angle, data_point[ft_name]));
  }
  return coordinates;
}

// Make the width of the slider the same as the width of the svg
document.addEventListener("DOMContentLoaded", function () {
  const svg = document.getElementById("radar-chart");
  const slider = document.getElementById("slider");
  slider.style.width = svg.clientWidth + "px";
});
