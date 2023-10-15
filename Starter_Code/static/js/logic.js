let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson";

// Create a map centered at [0, 0] with zoom level 2
let map = L.map('map').setView([0, 0], 2);

// Add a base map layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Create layer group for earthquake markers
let earthquakeLayer = L.layerGroup().addTo(map);

// Define a function to calculate the color based on depth
function getColor(depth) {
    return depth > 300 ? '#800026' :
        depth > 200 ? '#BD0026' :
        depth > 100 ? '#E31A1C' :
        depth > 50  ? '#FC4E2A' :
        depth > 10  ? '#FD8D3C' :
                        '#FFEDA0';
}

// Fetch earthquake data using D3
d3.json(url)
    .then(data => {
        // Loop through each earthquake feature
        data.features.forEach(feature => {
            // Extract properties
            let magnitude = feature.properties.mag;
            let depth = feature.geometry.coordinates[2];
            let place = feature.properties.place;

            // Create a circle marker with size and color based on magnitude and depth
            let marker = L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
                radius: magnitude * 5,  // Adjust the factor for appropriate size
                fillColor: getColor(depth),
                color: '#000',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });

            // Bind a popup with additional information
            marker.bindPopup(`<b>Location:</b> ${place}<br><b>Magnitude:</b> ${magnitude}<br><b>Depth:</b> ${depth} km`);

            // Add marker to the earthquake layer
            marker.addTo(earthquakeLayer);
        });

        // Add the earthquake layer to the map
        earthquakeLayer.addTo(map);

        // Create a legend using D3
        let legend = L.control({ position: 'bottomright' });

        legend.onAdd = function (map) {
            let div = L.DomUtil.create('div', 'info legend');
            let depths = [0, 10, 50, 100, 200, 300];
            let labels = [];

            for (let i = 0; i < depths.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' +
                    depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
            }

            return div;
        };

        legend.addTo(map);
    })
    .catch(error => console.error('Error fetching earthquake data:', error));
