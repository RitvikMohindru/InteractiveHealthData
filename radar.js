import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

// Load the gamified data
d3.csv("./radar_data/gamified_stats_by_second.csv")
  .then((data) => {
    data.forEach((d) => {
      d.time_elapsed = parseFloat(d.time_elapsed);
      d.bvp = parseFloat(d.bvp);
      d.eda = parseFloat(d.eda);
      d.temp = parseFloat(d.temp);
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
});