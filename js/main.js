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
    });

    earthquakeData = data; // Store the dataset globally

    // Initialize timeline and map
    updateVisualization();
  })
  .catch(error => console.error(error));

// Function to update timeline and map based on the current year
function updateVisualization() {
  createTimeline("#timeline-container", earthquakeData, currentYear);
  document.getElementById("year-label").textContent = currentYear;
  
  // Update map with filtered data for the selected year
  const filteredData = earthquakeData.filter(d => new Date(d.time).getFullYear() === currentYear);
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
  prevButton.textContent = `${currentYear-1}`;
  prevButton.className = "nav-button left";
  prevButton.addEventListener("click", () => {
    currentYear--;
    updateVisualization();
  });

  // Next Year Button
  const nextButton = document.createElement("button");
  nextButton.textContent = `${currentYear+1}`;
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
