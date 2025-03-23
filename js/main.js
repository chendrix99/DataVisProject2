import { createTimeline } from "./timeline.js";

let earthquakeData = []; // Store CSV data globally
let currentYear = 2024; // Default starting year
let leafletMap; // Placeholder for map instance

// Load earthquake data from CSV
d3.csv("data/2014-2025.csv")
  .then(data => {
    console.log("Number of items:", data.length);

    // Convert values and check for missing magnitude
    data.forEach(d => {
      if (!d.mag) console.warn("Missing mag value for:", d);
      d.latitude = +d.latitude;
      d.longitude = +d.longitude;
      d.mag = +d.mag;
      d.depth = +d.depth;
      d.duration = +d.duration;
    });

    earthquakeData = data; // Store the dataset globally

    // Initialize timeline and map
    updateVisualization();
  })
  .catch(error => console.error(error));

// Function to update timeline and map based on the current year
function updateVisualization() {
  let filteredData = earthquakeData.filter(d => new Date(d.time).getFullYear() === currentYear);
  createTimeline("#timeline-container", filteredData, currentYear);
  document.getElementById("year-label").textContent = currentYear;

  if (leafletMap) {
    leafletMap.updateData(filteredData); // Assuming `updateData` exists in your LeafletMap class
  } else {
    leafletMap = new LeafletMap({ parentElement: "#my-map" }, filteredData);
  }
}

// Create navigation buttons
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("timeline-container");

  // Previous Year Button
  const prevButton = document.createElement("button");
  prevButton.textContent = "<- previous year";
  prevButton.className = "nav-button left";
  prevButton.addEventListener("click", () => {
    currentYear--;
    updateVisualization();
  });

  // Next Year Button
  const nextButton = document.createElement("button");
  nextButton.textContent = "next year ->";
  nextButton.className = "nav-button right";
  nextButton.addEventListener("click", () => {
    currentYear++;
    updateVisualization();
  });

  // Year Label
  const yearLabel = document.createElement("span");
  yearLabel.id = "year-label";
  yearLabel.textContent = currentYear;
  yearLabel.style.fontSize = "20px";
  yearLabel.style.margin = "0 15px";

  // Button Container
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "button-container";
  buttonContainer.appendChild(prevButton);
  buttonContainer.appendChild(yearLabel);
  buttonContainer.appendChild(nextButton);

  document.body.appendChild(buttonContainer);
});

// Event listeners for filter buttons
document.getElementById("apply-filter").addEventListener("click", applyFilters);
document.getElementById("clear-filter").addEventListener("click", clearFilters);

function applyFilters() {
  let filteredData = earthquakeData.filter(d => new Date(d.time).getFullYear() === currentYear);

  if (document.getElementById("filter-depth").checked) {
    let minDepth = parseFloat(document.getElementById("min-depth").value);
    let maxDepth = parseFloat(document.getElementById("max-depth").value);
    filteredData = filteredData.filter(d => 
      (isNaN(minDepth) || d.depth >= minDepth) && 
      (isNaN(maxDepth) || d.depth <= maxDepth)
    );
  }

  if (document.getElementById("filter-magnitude").checked) {
    let minMagnitude = parseFloat(document.getElementById("min-magnitude").value);
    let maxMagnitude = parseFloat(document.getElementById("max-magnitude").value);
    filteredData = filteredData.filter(d => 
      (isNaN(minMagnitude) || d.mag >= minMagnitude) && 
      (isNaN(maxMagnitude) || d.mag <= maxMagnitude)
    );
  }

  if (document.getElementById("filter-duration").checked) {
    let minDuration = parseFloat(document.getElementById("min-duration").value);
    let maxDuration = parseFloat(document.getElementById("max-duration").value);
    filteredData = filteredData.filter(d => 
      (isNaN(minDuration) || d.duration >= minDuration) && 
      (isNaN(maxDuration) || d.duration <= maxDuration)
    );
  }

  createTimeline("#timeline-container", filteredData, currentYear);
  leafletMap.updateData(filteredData);
}

function clearFilters() {
  document.getElementById("filter-depth").checked = false;
  document.getElementById("filter-magnitude").checked = false;
  document.getElementById("filter-duration").checked = false;
  document.getElementById("min-depth").value = "";
  document.getElementById("max-depth").value = "";
  document.getElementById("min-magnitude").value = "";
  document.getElementById("max-magnitude").value = "";
  document.getElementById("min-duration").value = "";
  document.getElementById("max-duration").value = "";
  updateVisualization();
}
