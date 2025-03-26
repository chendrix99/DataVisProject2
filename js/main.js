import { createTimeline } from "./timeline.js";

let earthquakeData = []; // Store CSV data globally
let currentYear = 2024; // Default starting year
let leafletMap; // Placeholder for map instance
let animationInterval;
let currentIndex = 0;
let isPlaying = false;
let animationSpeed = 100;

// Load earthquake data from CSV
d3.csv("data/2014-2025.csv")
  .then((data) => {
    console.log("Number of items:", data.length);

    // Convert values and check for missing magnitude
    data.forEach((d) => {
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
  .catch((error) => console.error(error));

// Function to update timeline and map based on the current year
function updateVisualization() {
  let filteredData = earthquakeData.filter(
    (d) => new Date(d.time).getFullYear() === currentYear
  );
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
  const prevButton = document.getElementById("prev-year");
  const nextButton = document.getElementById("next-year");
  const yearLabel = document.getElementById("year-label");
  const playPauseButton = document.getElementById("play-pause-button");

  // Previous Year
  prevButton.addEventListener("click", () => {
    currentYear--;
    yearLabel.textContent = currentYear;
    updateVisualization();
  });

  // Next Year
  nextButton.addEventListener("click", () => {
    currentYear++;
    yearLabel.textContent = currentYear;
    updateVisualization();
  });

  // Animation Code
  document.getElementById("speed-up").addEventListener("click", () => {
    if (animationSpeed > 50) {
      // Prevents excessive fast-forwarding
      animationSpeed -= 50;
      updateAnimationSpeed();
    }
  });

  document.getElementById("speed-back").addEventListener("click", () => {
    animationSpeed += 50;
    updateAnimationSpeed();
  });

  document.getElementById("stop-button").addEventListener("click", () => {
    clearInterval(animationInterval); // Stop the animation
    isPlaying = false;
    currentIndex = 0;
    updateVisualization();
    document.getElementById("play-pause-button").innerHTML =
      '<i class="fa fa-play fa-2x"></i>';
  });

  playPauseButton.addEventListener("click", () => {
    if (isPlaying) {
      clearInterval(animationInterval);
      isPlaying = false;
      playPauseButton.innerHTML = '<i class="fa fa-play fa-2x"></i>';
    } else {
      isPlaying = true;
      playPauseButton.innerHTML = '<i class="fa fa-pause fa-2x"></i>';
      startAnimation();
    }
  });

  function startAnimation() {
    if (isPlaying) {
      clearInterval(animationInterval); // Ensure no overlapping intervals
      animationInterval = setInterval(playNextFrame, animationSpeed);
    }
  }

  function playNextFrame() {
    let filteredData = earthquakeData.filter(
      (d) => new Date(d.time).getFullYear() === currentYear
    );

    filteredData = applyFilters();

    let currentDataSubset = filteredData.slice(0, currentIndex + 1);

    createTimeline("#timeline-container", currentDataSubset, currentYear);
    leafletMap.updateData(currentDataSubset);

    currentIndex++;

    if (currentIndex >= filteredData.length) {
      clearInterval(animationInterval);
      isPlaying = false;
      playPauseButton.innerHTML = '<i class="fa fa-play fa-2x"></i>';
    }
  }

  function updateAnimationSpeed() {
    if (isPlaying) {
      clearInterval(animationInterval);
      animationInterval = setInterval(playNextFrame, animationSpeed);
    }
    document.querySelector(".animation_speed").textContent =
      animationSpeed + " ms";
  }
});

// Event listeners for filter buttons
document.getElementById("apply-filter").addEventListener("click", applyFilters);
document.getElementById("clear-filter").addEventListener("click", clearFilters);

function applyFilters() {
  let filteredData = earthquakeData.filter(
    (d) => new Date(d.time).getFullYear() === currentYear
  );

  if (document.getElementById("filter-depth").checked) {
    let minDepth = parseFloat(document.getElementById("min-depth").value);
    let maxDepth = parseFloat(document.getElementById("max-depth").value);
    filteredData = filteredData.filter(
      (d) =>
        (isNaN(minDepth) || d.depth >= minDepth) &&
        (isNaN(maxDepth) || d.depth <= maxDepth)
    );
  }

  if (document.getElementById("filter-magnitude").checked) {
    let minMagnitude = parseFloat(
      document.getElementById("min-magnitude").value
    );
    let maxMagnitude = parseFloat(
      document.getElementById("max-magnitude").value
    );
    filteredData = filteredData.filter(
      (d) =>
        (isNaN(minMagnitude) || d.mag >= minMagnitude) &&
        (isNaN(maxMagnitude) || d.mag <= maxMagnitude)
    );
  }

  if (document.getElementById("filter-duration").checked) {
    let minDuration = parseFloat(document.getElementById("min-duration").value);
    let maxDuration = parseFloat(document.getElementById("max-duration").value);
    filteredData = filteredData.filter(
      (d) =>
        (isNaN(minDuration) || d.duration >= minDuration) &&
        (isNaN(maxDuration) || d.duration <= maxDuration)
    );
  }

  createTimeline("#timeline-container", filteredData, currentYear);
  leafletMap.updateData(filteredData);
  return filteredData;
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
