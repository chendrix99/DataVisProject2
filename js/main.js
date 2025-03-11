d3.csv('data/2024-2025.csv')
.then(data => {
    console.log("number of items: " + data.length);

    data.forEach(d => {
      d.latitude = +d.latitude; 
      d.longitude = +d.longitude;  
    });

    // Initialize chart and then show it
    leafletMap = new LeafletMap({ parentElement: '#my-map'}, data);


  })
  .catch(error => console.error(error));
