
//GEOG 572 Lab 5
// Mackenzie Karnstein

//Note: ChatGTP was used to guide code development/editing [including for explaining javascript and Leaflet logistics, editing, and troubleshooting.]
//Load the data

//declare global map variables
var map;
var geojson;
var geojson_2;
var geojson_normal;
var dams;
var watershed_c;
var prop_symb;
var minValue;

function jsAjax(){
    //use Fetch to retrieve data
    
    fetch('Watershed_Council.geojson')
        .then(conversion) //convert data to usable form
        .then(callback) //send retrieved data to a callback function
    };

function add_second_layer(){
    fetch('Dam_Facilities.geojson')
        .then(conversion1)
        .then(callback1)    
    };
function calculateMinValue(watershed_c){
    var allValues = [];
    //loop through each city
    for(var feature of watershed_c.features){
        var value = feature.properties.dam_count;
        if (value > 0){
            allValues.push(value);
        }
    }
    var minValue = Math.min(...allValues);

    return minValue;
}

function calcPropRadius(PropSymbValue) {
    var minRadius = 5;
    var radius = 1.0083 * Math.pow(PropSymbValue/minValue,0.5715) * minRadius / 4;

    return radius;
};
function createPropSymbols(data){

    if(prop_symb){
        map.removeLayer(prop_symb);
    }

    prop_symb = L.layerGroup();

    data.features.forEach(function(feature){
        var centroid = turf.centroid(feature);
        var coordinates = centroid.geometry.coordinates;
        var latlng = L.latLng(coordinates[1], coordinates[0]);
        var PropSymbValue = Number(feature.properties.dam_count);
        var PropSymbMarker = L.circleMarker(latlng,{
                            radius: calcPropRadius(PropSymbValue),
                            fillColor: "#5b0759",
                            color: "#ff0000",
                            weight: 1,
                            opacity: 1,
                            fillOpacity: 0.2
        });
        prop_symb.addLayer(PropSymbMarker);
    });

    prop_symb.addTo(map);
    };


function choropleth(){
    watershed_c.features.forEach(function(poly){
       let ptsWithin = turf.pointsWithinPolygon(dams, poly);
       //By total number
       poly.properties.dam_count = ptsWithin.features.length;
       //By density
       poly.properties.dam_density_1000acres = poly.properties.dam_count / (poly.properties.Acres / 1000);
    });
    watershed_c.features.forEach(function(poly){
    let ptsWithin = turf.pointsWithinPolygon(dams, poly);
    });
/////
    minValue = calculateMinValue(watershed_c);
    createPropSymbols(watershed_c);

//////
    if(geojson){
        map.removeLayer(geojson);
    }
    geojson = L.geoJson(watershed_c,{
        style: style_choropleth
    }).addTo(map);

    geojson_normal = L.geoJson(watershed_c,{
        style: style_normalized
    }).addTo(map);

    geojson.addTo(map);

    var overlayMaps = {
    "Proportional Symbols": prop_symb,
    "Total Dams": geojson,
    "Dams per 1000 Acres": geojson_normal
    };
    L.control.layers(null, overlayMaps, { collapsed: false}).addTo(map);
    choropleth_legend();
}

function getColor(d) {
    return d > 35 ? '#07042e' :
           d > 30  ? '#0d084a' :
           d > 25  ? '#110b68' :
           d > 20  ? '#180f90' :
           d > 15   ? '#271eaf' :
           d > 10   ? '#5f57ca' :
           d > 5   ? '#8c87c6' :
                      '#9f9cc5';
}

function style_choropleth(feature) {
    return {
        fillColor: getColor(feature.properties.dam_count),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 1
    };
}

function getColor2(d) {
    return d > 0.35 ? '#07042e' :
           d > 0.3  ? '#0d084a' :
           d > 0.25  ? '#110b68' :
           d > 0.2  ? '#180f90' :
           d > 0.15   ? '#271eaf' :
           d > 0.1   ? '#5f57ca' :
           d > 0.05   ? '#8c87c6' :
                      '#9f9cc5';
}

function style_normalized(feature) {
    return {
        fillColor: getColor2(feature.properties.dam_density_1000acres),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 1
    };
}

function style_dam(feature) {
    return {
        radius:2,
        fillColor: '#102c18',
        fillOpacity: 1,
        weight: 2,
        opacity: 1,
        color: '#606260',
        dashArray: '3'
    };
}

function choropleth_legend(){
    var legend = L.control({position: 'bottomright'});
    var legend2 = L.control({position: 'bottomleft'});
    legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 5, 10, 15, 20, 25, 30, 35],
        labels = [
            '0-5 dams', 
            '5-10 dams',
            '10-15 dams',
            '15-20 dams',
            '20-25 dams',
            '25-30 dams',
            '30-35 dams',
            'Over 35 dams'
        ];
        div.innerHTML += '<h3>Dams Total</h3>';
        //labels = [];
    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            labels[i] + '<br>';
    }

    return div;
    };

    legend.addTo(map);

    legend2.onAdd = function (map) {

    var div2 = L.DomUtil.create('div2', 'info legend2'),
        grades = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35],
        labels = [
            '0-0.05 dams', 
            '0.05-0.10 dams',
            '0.10-0.15 dams',
            '0.15-0.20 dams',
            '0.20-0.25 dams',
            '0.25-0.30 dams',
            '0.30-0.35 dams',
            'Over 0.35 dams'
        ];
        div2.innerHTML += '<h3>Dams per 1000 Acres</h3>';
        //labels = [];
    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div2.innerHTML +=
            '<i style="background:' + getColor2(grades[i] + 0.001) + '"></i> ' +
            labels[i] + '<br>';
    }

    return div2;
    };

    legend2.addTo(map);
}
//define conversion function
function conversion(response){
  //convert data to usable form
  return response.json();
}

//define callback function
function callback(response2){

    console.log(response2);
    watershed_c = response2;

    //create map element
    map = L.map('map').setView([44.0, -120.5], 6);
    //add tile layer
    var tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    //Add features to map
    geojson = L.geoJson(watershed_c,{
        style: {color: 'gray', weight: 2, fillOpacity: 0.3 }
    }
    ).addTo(map);

    //start function for loading second layer
    add_second_layer();
}

//define conversion1 function
function conversion1(response_second){
  //convert data to usable form
  return response_second.json();
}

//define callback1 function
function callback1(response_second2){
    console.log(response_second2);
    dams = response_second2;
    
    //Add second set of features to map
     geojson_2 = L.geoJson(response_second2, {
        pointToLayer: function(feature, latlng){
            return L.circleMarker(latlng, style_dam(feature));
        }
    }).addTo(map);

   choropleth()

}

window.onload = jsAjax;

