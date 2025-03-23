export function createTimeline(container, data, year) {
    console.log(`Creating timeline for year: ${year}`);

    const width = 1200;
    const height = 150;
    const timelineY = height / 2;

    // Parse and filter data
    const parsedData = data
        .map(d => ({
            timestamp: new Date(d.time),
            mag: +d.mag,
            depth: +d.depth
        }))
        .filter(d => d.timestamp.getFullYear() === year);

    console.log(`Filtered Data (${year}):`, parsedData);

    // Clear previous visualization
    d3.select(container).select("svg").remove();

    // Set timeline domain
    const xDomain = [new Date(`${year}-01-01`), new Date(`${year}-12-31`)];

    // Create time scale
    const xScale = d3.scaleTime()
        .domain(xDomain)
        .range([50, width - 50]);

    // Create SVG container
    const svg = d3.select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height);


    // Magnitude scale (for bar height)
    const magScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.mag)])
        .range([5, height]); // Ensures bars are tall enough


    // Add bars (one per earthquake)
    svg.selectAll(".quake-bar")
        .data(parsedData)
        .join("line")
        .attr("x1", d => xScale(d.timestamp))
        .attr("x2", d => xScale(d.timestamp))
        .attr("y1", height - 60) // Start at baseline
        .attr("y2", d => height - magScale(d.mag)) // Scale height based on magnitude
        .attr("stroke", d => getColor(d.mag)) // Use the same color function as dots
        .attr("stroke-width", 2.5)
        .attr("opacity", 0.7);

    const depthScale = d3.scaleLinear()
        .domain([0, d3.max(parsedData, d => d.depth)]) // Depth domain
        .range([0, 20]); // Controls bar length (adjust if needed)
    
    // // Add downward bars for depth
    svg.selectAll(".depth-bar")
        .data(parsedData)
        .join("line")
        .attr("x1", d => xScale(d.timestamp))
        .attr("x2", d => xScale(d.timestamp))
        .attr("y1", timelineY + 13) // Start slightly below timeline
        .attr("y2", d => timelineY + 20 + depthScale(d.depth)) // Extend downward
        .attr("stroke", "lightgray")
        .attr("stroke-width", 2)
        .attr("opacity", 0.6);

    const xAxis = d3.axisBottom(xScale).ticks(12).tickFormat(d3.timeFormat("%b"));
        svg.append("g")
            .attr("transform", `translate(0, ${height - (height/2)+12})`)
            .call(xAxis);

        // Add Magnitude Label (above the axis)
    svg.append("text")
        .attr("x", 60) // Position on the left
        .attr("y", timelineY - 60) // Slightly above the timeline
        .attr("text-anchor", "end")
        .attr("font-size", "14px")
        .attr("fill", "black")
        .text("Magnitude");

    // Add Depth Label (below the axis)
    svg.append("text")
        .attr("x", 50) // Align with Magnitude label
        .attr("y", timelineY + 50) // Slightly below the timeline
        .attr("text-anchor", "end")
        .attr("font-size", "14px")
        .attr("fill", "black")
        .text("Depth");

}


function getColor(mag) {
    if (mag < 3) return "blue";
    if (mag < 4) return "green";
    if (mag < 4.5) return "yellow";
    if (mag < 5) return "gold";
    if (mag < 5.5) return "orange";
    return "red";
}

