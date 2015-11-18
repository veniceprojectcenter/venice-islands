
// ~~~~~~~~~~ layers with maps/working points ~~~~~~~~~~~~~
//var getReq = $.getJSON("https://cityknowledge.firebaseio.com/groups/MAPS%20Bridges.json",getGroupCallback);
getGroup("https://cityknowledge.firebaseio.com/groups/MAPS%20Bridges.json","Bridges",{style: style2, onEachFeature:setupHighlight});
//getGroup("https://cityknowledge.firebaseio.com/groups/MAPS%20Canals.json","Canals",{onEachFeature:setupHighlight});
//featureCollections["Canals"].bindPopup("I am a canal");

//getGroup("https://cityknowledge.firebaseio.com/groups/MAPS%20Canal%20Segments.json","Canal Segments",{style: style2});
getGroup("https://cityknowledge.firebaseio.com/groups/belltowers%20MAPS%2015.json","Bell Towers",{style: style2, onEachFeature:setupHighlight,pointToLayer: function(feature,latlng){
    return new L.marker(latlng, {icon: churchIcon}).bindPopup("Hover over for more info")}});
//getGroup("https://cityknowledge.firebaseio.com/groups/maps_HOTELS08_PT_15.json","HotelsMap",{style: style2});
//getGroup("https://cityknowledge.firebaseio.com/groups/maps_HOLES_PT_15.json","Sewer Outlets",{style: style2});

// ~~~~~~~~ layers with just lat/long ~~~~~~~~~~~~~~~~~~~~~
//getGroup("https://cityknowledge.firebaseio.com/groups/Hostels,%20Hotels.json","Hotels",{pointToLayer: function(feature,latlng){
////    return new L.CircleMarker(latlng, {
////                    radius: 5,
////                    fillColor: "#A3C990",
////                    color: "#000",
////                    weight: 1,
////                    opacity: 1,
////                    fillOpacity: 0.4
////                });
//    return new L.marker(latlng, {icon: churchIcon});
//}});
//getGroup("https://cityknowledge.firebaseio.com/groups/Bed%20&%20Bfast,%20Apartments.json","Bed and Breakfasts");
//getGroup("https://cityknowledge.firebaseio.com/groups/store%20locations.json","Stores"); //2014 data

// ~~~~~~~~ historical data (still just lat/long) ~~~~~~~~~
//getGroup("https://cityknowledge.firebaseio.com/groups/Demolished%20Churches.json");
getGroup("https://cityknowledge.firebaseio.com/groups/Island%20Church%20Data.json","Island Churches",{pointToLayer: function(feature,latlng){
    return new L.marker(latlng, {icon: conventIcon}).bindPopup("I am a church");
}});
//getGroup("https://cityknowledge.firebaseio.com/groups/Convents%20Data.json", "Convents",{pointToLayer: function(feature,latlng){
//    return new L.marker(latlng, {icon: conventIcon}).bindPopup("I am a convent");
//}});

// the above layer probably matches up with the images in
//https://cityknowledge.firebaseio.com/groups/convent%20floor%20plans.json"

// ~~~~~~~~ useful datasets not tagged by location ~~~~~~~~
// https://cityknowledge.firebaseio.com/groups/SUBGROUP%20Boat%20Traffic%20Counts%20by%20Station.json
// https://cityknowledge.firebaseio.com/groups/SUBGROUP%20Latest%20Traffic%20Counts%20By%20Station.json

//var poly = new Array({x:0,y:0},{x:2,y:0},{x:2,y:2},{x:0,y:2},{x:0,y:0});
//var point = {x:1,y:1};
//console.log(point);
//console.log(pointInPoly(point,poly));