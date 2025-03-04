import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let gamified_data = [];     // Global variable to store the gamified data
let non_gamified_data = []; // Global variable to store the non-gamified data

// Load the gamified data
d3.csv("./radar_data/gamified_stats_by_second.csv", (d) => {
    d.time_elapsed = parseFloat(d.time_elapsed);
    d.bvp = parseFloat(d.bvp);
    d.eda = parseFloat(d.eda);
    d.temp = parseFloat(d.temp);
    return d;
  }).then(gamified_data => {  // Ensure we wait for the CSV data
    console.log("Loaded Gamified Data:", gamified_data)
  });

// Load the non-gamified data
d3.csv("./radar_data/non_gamified_stats_by_second.csv", (d) => {
  d.time_elapsed = parseFloat(d.time_elapsed);
  d.bvp = parseFloat(d.bvp);
  d.eda = parseFloat(d.eda);
  d.temp = parseFloat(d.temp);
  return d;
}).then(non_gamified_data => {  // Ensure we wait for the CSV data
  console.log("Loaded Non-Gamified Data:", non_gamified_data)
});

  const width = 500;
  const height = 500;

  let svg = d3.select("#radar-chart");

  // Scale for the radius
  const rScale = d3.scaleLinear()
      .range([0, 200])
      .domain([0, 1]);
  let ticks = [0.2, 0.4, 0.6, 0.8, 1];
	
	//Draw the background circles
	svg.selectAll("circle")
    .data(ticks)
    .join(
        enter => enter.append("circle")
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .attr("fill", "none")
            .attr("stroke", "gray")
            .attr("r", d => rScale(d))
    );

  // Add labels for each circle
  svg.selectAll(".ticklabel")
    .data(ticks)
    .join(
        enter => enter.append("text")
            .attr("class", "ticklabel")
            .attr("x", width / 2 + 5)
            .attr("y", d => height / 2 - rScale(d))
            .text(d => d.toString())
    );

  let features = ['bvp', 'eda', 'temp'];
  let featureData = features.map((f, i) => {
      let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
      return {
          "name": f,
          "angle": angle,
          "line_coord": angleToCoordinate(angle, 1),
          "label_coord": angleToCoordinate(angle, 1.1)
      };
  });
  
  // draw axis lines
  svg.selectAll("line")
      .data(featureData)
      .join(
          enter => enter.append("line")
              .attr("x1", width / 2)
              .attr("y1", height / 2)
              .attr("x2", d => d.line_coord.x)
              .attr("y2", d => d.line_coord.y)
              .attr("stroke","black")
      );
  
  // draw axis labels
  svg.selectAll(".axislabel")
      .data(featureData)
      .join(
          enter => enter.append("text")
              .attr("x", d => d.label_coord.x)
              .attr("y", d => d.label_coord.y)
              .text(d => d.name)
      );

function angleToCoordinate(angle, value){
  let x = Math.cos(angle) * rScale(value);
  let y = Math.sin(angle) * rScale(value);
  return {"x": width / 2 + x, "y": height / 2 - y};
}

// Make the width of the slider the same as the width of the svg
document.addEventListener("DOMContentLoaded", function() {
  const svg = document.getElementById("radar-chart");
  const slider = document.getElementById("slider");
  slider.style.width = svg.clientWidth + "px";
});