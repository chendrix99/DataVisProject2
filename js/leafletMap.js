class LeafletMap {
  /**
   * Class constructor with basic configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
    };
    this.data = _data;
    this.initVis();
  }

  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    let vis = this;

    //ESRI
    vis.esriUrl =
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    vis.esriAttr =
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community";

    //TOPO
    vis.topoUrl = "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png";
    vis.topoAttr =
      'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)';

    //Thunderforest Outdoors-
    vis.thOutUrl =
      "https://{s}.tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey={apikey}";
    vis.thOutAttr =
      '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    //Stamen Terrain
    vis.stUrl =
      "https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}";
    vis.stAttr =
      'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    //this is the base map layer, where we are showing the map background
    vis.base_layer = L.tileLayer(vis.esriUrl, {
      id: "esri-image",
      attribution: vis.esriAttr,
      ext: "png",
    });

    vis.theMap = L.map("my-map", {
      center: [30, 0],
      zoom: 2,
      layers: [vis.base_layer],
    });

    //initialize svg for d3 to add to map
    L.svg({ clickable: true }).addTo(vis.theMap); // we have to make the svg layer clickable
    vis.overlay = d3.select(vis.theMap.getPanes().overlayPane);
    vis.svg = vis.overlay.select("svg").attr("pointer-events", "auto");

    // We will use a logarithmic scale for sizing the circles
    vis.magScale = d3
      .scaleLog()
      .domain([d3.min(vis.data, (d) => d.mag), d3.max(vis.data, (d) => d.mag)])
      .range([3, 30]); // Can play with this range to see what looks good

    //these are the city locations, displayed as a set of dots
    vis.Dots = vis.svg
      .selectAll("circle")
      .data(vis.data)
      .join("circle")
      .attr("fill", "steelblue") //---- TO DO- color by magnitude
      .attr("stroke", "black")
      .attr(
        "cx",
        (d) => vis.theMap.latLngToLayerPoint([d.latitude, d.longitude]).x
      )
      .attr(
        "cy",
        (d) => vis.theMap.latLngToLayerPoint([d.latitude, d.longitude]).y
      )
      .attr("r", (d) => vis.magScale(d.mag))
      .on("mouseover", function (event, d) {
        //function to add mouseover event
        d3.select(this)
          .transition() //D3 selects the object we have moused over in order to perform operations on it
          .duration("150") //how long we are transitioning between the two states (works like keyframes)
          .attr("fill", "red"); //change the fill

        //create a tool tip
        d3.select("#tooltip")
          .style("opacity", 1)
          .style("z-index", 1000000)
          // Format number with million and thousand separator
          .html(
            `<div class="tooltip-label">Place: ${
              d.place
            }, Magnitude: ${d3.format(",")(d.mag)}</div>`
          );
      })
      .on("mousemove", (event) => {
        //position the tooltip
        d3.select("#tooltip")
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + 10 + "px");
      })
      .on("mouseleave", function () {
        //function to add mouseover event
        d3.select(this)
          .transition() //D3 selects the object we have moused over in order to perform operations on it
          .duration("150") //how long we are transitioning between the two states (works like keyframes)
          .attr("fill", "steelblue") //change the fill  TO DO- change fill again
          .attr("r", vis.magScale(d.mag)); //change radius

        d3.select("#tooltip").style("opacity", 0); //turn off the tooltip
      });

    //handler here for updating the map, as you zoom in and out
    vis.theMap.on("zoomend", function () {
      vis.updateVis();
    });

    // Add event listener to the dropdown menu
    document
      .getElementById("map-style-select")
      .addEventListener("change", function () {
        const selectedStyle = this.value;
        vis.updateMapLayer(selectedStyle);
      });
  }

  updateMapLayer(style) {
    let vis = this;

    // Remove current base layer
    vis.theMap.removeLayer(vis.base_layer);

    // Set new base layer based on selected style
    switch (style) {
      case "Esri.WorldImagery":
        vis.base_layer = L.tileLayer(vis.esriUrl, {
          id: "esri-image",
          attribution: vis.esriAttr,
          ext: "png",
        });
        break;
      case "OpenTopoMap":
        vis.base_layer = L.tileLayer(vis.topoUrl, {
          attribution: vis.topoAttr,
          ext: "png",
        });
        break;
      case "Thunderforest.Outdoors":
        vis.base_layer = L.tileLayer(vis.thOutUrl, {
          attribution: vis.thOutAttr,
          ext: "png",
        });
        break;
      case "Stamen.Terrain":
        vis.base_layer = L.tileLayer(vis.stUrl, {
          attribution: vis.stAttr,
          ext: "png",
        });
        break;
      default:
        vis.base_layer = L.tileLayer(vis.esriUrl, {
          id: "esri-image",
          attribution: vis.esriAttr,
          ext: "png",
        });
        break;
    }

    // Add the new base layer to the map
    vis.base_layer.addTo(vis.theMap);
  }

  updateVis() {
    let vis = this;

    //redraw based on new zoom- need to recalculate on-screen position
    vis.Dots.attr(
      "cx",
      (d) => vis.theMap.latLngToLayerPoint([d.latitude, d.longitude]).x
    )
      .attr(
        "cy",
        (d) => vis.theMap.latLngToLayerPoint([d.latitude, d.longitude]).y
      )
      .attr("fill", "steelblue") //---- TO DO- color by magnitude
      .attr("r", vis.magScale(d.mag));
  }

  renderVis() {
    let vis = this;

    //not using right now...
  }
}
