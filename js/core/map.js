var featureCollections={};
var islandsCollection={};

var feature_layers = [];
//{
//  feature:
//  layer:
//  parent:
//}

var overlayFlag = 0;

var map = L.map('map').setView([45.4375, 12.3358], 13);

//**********************************************************************************************
var defaultLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/mapbox.run-bike-hike/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IjZjNmRjNzk3ZmE2MTcwOTEwMGY0MzU3YjUzOWFmNWZhIn0.Y8bhBaUMqFiPrDRW9hieoQ', {
    maxZoom: 20, minZoom: 10,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.run-bike-hike'
}).addTo(map);

var satelliteLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/mapbox.streets-satellite/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IjZjNmRjNzk3ZmE2MTcwOTEwMGY0MzU3YjUzOWFmNWZhIn0.Y8bhBaUMqFiPrDRW9hieoQ', {
    maxZoom: 20, minZoom: 10,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.streets-satellite'
});

var basicLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/mapbox.outdoors/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IjZjNmRjNzk3ZmE2MTcwOTEwMGY0MzU3YjUzOWFmNWZhIn0.Y8bhBaUMqFiPrDRW9hieoQ', {
    maxZoom: 20, minZoom: 10,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.outdoors'
});
//**********************************************************************************************

function partial(func /*, 0..n args */) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    var allArguments = args.concat(Array.prototype.slice.call(arguments));
    return func.apply(this, allArguments);
  };
}


//**********************************************************************************************

// This section is used to track where the user's cursor is located and perform events based on 
// its location
function highlightFeature(e) {
    var layer = e.target;
    
    // instead of updating info on one layer, an if statement can be used here to show info
    // on multiple layers. for more info, see the following:
    //http://gis.stackexchange.com/questions/68941/how-to-add-remove-legend-with-leaflet-layers-control
    if(layer.feature.properties.islands){
         //// islands stored layer.feature.properties.islands as an ARRAY
         //mapInfo.update(layer.feature.properties.data);
         //console.log("layer exists");
        mapInfo.update(layer.feature.properties.data,layer.feature.properties.islands);
    } else {
         layer.setStyle(Highlight_style(layer.feature));
         mapInfo.update(layer.feature.properties);
    }
    
}

function resetHighlight(e) {
        var layer = e.target;
       // console.log(e.target);
        if(!layer.feature.properties.data){
            islands_layer.resetStyle(e.target)
        }
    
        mapInfo.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
    var currentLayer = e.target;
    overlay(currentLayer);
}

function saveAndHighlight(parent, feature, layer) {
    console.log("saveAndHighlight");
    saveFeature(parent, feature, layer)
    setupHighlight(feature,layer);
}

function saveFeature(parent, feature, layer){
    var obj = {
        parent:parent,
        feature:feature,
        layer:layer
    }
    if(feature.index){
        feature_layers[feature.index] = obj
    }
    else{
        feature.index = feature_layers.length;
        feature_layers.push(obj);
    }
}

function setupHighlight(feature, layer) {
    if(layer.feature.properties.data){
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight
        });
    } else {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            dblclick: zoomToFeature
        });
    }
}

//**********************************************************************************************

// add base geojson to map with islands data
var islands_layer = L.geoJson(null, {
    style: Island_style,
    onEachFeature: partial(saveAndHighlight,islands_layer)
}).addTo(map);

function refreshFilter(){
    for(var i=0,iLen=feature_layers.length;i<iLen;i++){
        var feature = feature_layers[i].feature;
        var layer = feature_layers[i].layer;
        var parent = feature_layers[i].parent || map;
        
        if((feature && layer && parent) && feature.visible_changed){
            if(feature.visible){
                if(!parent.hasLayer(layer)){
                    parent.addLayer(layer);
                }
            }
            else if(parent.hasLayer(layer)){
                parent.removeLayer(layer);
            }
        }
    }
}

//console.log(geojson);
//**********************************************************************************************
// set up an information box for population data

var mapInfo = L.control();

mapInfo.onAdd = function (map){
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this._div.style.maxWidth = "300px";
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed

mapInfo.update = function (props,props2) {
    
    this._div.innerHTML = '<h4>General Information</h4>' +// + propString;
       (props ?
        '<h2>CK Console Data:</h2>' + printObject(props)
        : 'Hover over a feature <br /> Double click for more info' ) 
        + (props2 ? '<h2>Island Sort Algorithm Results:</h2>' + printObject(props2) : '');
};

mapInfo.addTo(map);

//**********************************************************************************************
// add location functionality
// set this to true to auto-zoom on your location
map.locate({setView: false, maxZoom: 18});

// create a global var for the location layer - must be global so it can be toggled
var locationLayer = L.layerGroup().addTo(map); 

// function to excecute when the user's location is found
function onLocationFound(e) {
    var radius = e.accuracy / 2;
    
    // Create a marker with a popup at the location 
    var locationMarker =  L.marker(e.latlng);
        //.bindPopup("You are within " + radius + " meters from this point").openPopup();

    // Create an additional circle showing the approximate radius
    var locationRadius = L.circle(e.latlng, radius, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5 
    });
    
    // add the marker and popup to the location layer
    locationLayer.addLayer(locationMarker);
    locationLayer.addLayer(locationRadius);
    locationMarker.bindPopup("<center><b>You are here!</b><br>Within " + radius + " meters </center>");//.openPopup();
    // make sure it stays on top of everything else
    //locationLayer.bringToFront();
}
map.on('locationfound', onLocationFound);

// function to excecute when the users location isn't found
function onLocationError(e) {
    //alert(e.message);
}
map.on('locationerror', onLocationError);

//**********************************************************************************************

// Displays question mark and vpc logo
var VPCinfo = L.control({position: "bottomleft"});
    
VPCinfo.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'VPCinfo'); // create a div with a class "info"
    this._div.innerHTML = '<div class="info" style="width:auto;">'+
        '<span ng-click="showAbout()"><img src="image/about.png"  style="cursor:pointer;padding-right:7px;"></span>'+
        '<a href="http://veniceprojectcenter.org" target="_blank"><img src="image/vpc25logo.png"></a>'+
        '</div>';
    return this._div;
};

VPCinfo.addTo(map);

//**********************************************************************************************

// define the base and overlay maps so that they can be toggled
var baseMaps = {
    "Default": defaultLayer,
    "Satellite": satelliteLayer,
    "Basic": basicLayer
};

var mapOverlays = {
    "Current Location": locationLayer
};

// add in layer control so that you can toggle the layers
var layerController = L.control.layers(baseMaps,mapOverlays).addTo(map);
layerController.getContainer().ondblclick = function(e){
    if(e.stopPropagation){
        e.stopPropagation();
    }
}

//*******************************************************************************************

//*******************************************************************************************

//Save the loading status of every data group added
//array of vars. var = {count,complete,maxCount}
var loadStatus = [];

function getGroupCallback(options,customArgs,groupURL,msg) {
    jsonList = msg;
    //console.log(jsonList.members);
    var statusIndex = loadStatus.length;
    loadStatus.push({});
    
    if(options && options.tag){
        initializeCollection(statusIndex,options,customArgs,groupURL,jsonList);
    }
    
    loadStatus[statusIndex].count = 0;
    
    if(options && featureCollections[options.tag]){
        loadStatus[statusIndex].complete = false;
        return;
    }
    
    var count = 0;
    for(var obj in jsonList.members){
        //var URL = "https://"+ groupURL.split("/")[2]+"/data/" + obj + ".json";
        //console.log(URL);
        //$.getJSON(URL,function(msg){getEntryCallback(statusIndex,options,customArgs,groupURL,jsonList,msg);});
        if(count == 0){
            getNextEntry(statusIndex,options,customArgs,groupURL,jsonList);
        }
        
//        $.ajax({
//            dataType: "json",
//            url: URL,
//            success: function(msg){getEntryCallback(statusIndex,options,customArgs,groupURL,jsonList,msg);},
//            async:false
//        });
        count++;
    }
    loadStatus[statusIndex].maxCount = count;
}

function getNextEntry(statusIndex,options,customArgs,groupURL,groupMSG){
    jsonList = groupMSG;
    //console.log(jsonList.members);
    
    if(options && options.tag){
        if(loadStatus[statusIndex].complete == true) return;
        initializeCollection(statusIndex,options,customArgs,groupURL,jsonList);
    }

    var count = 0;
    for(var obj in jsonList.members){
        if(count>=loadStatus[statusIndex].count){
            var URL = "https://"+ groupURL.split("/")[2]+"/data/" + obj + ".json";
            //console.log(URL);
            $.getJSON(URL,function(msg){getEntryCallback(statusIndex,options,customArgs,groupURL,jsonList,msg);});
            count++;
            loadStatus[statusIndex].count=count;
            return false;
        }
    }
    loadStatus[statusIndex].complete = true;
    return true;
}

function finishGetEntries(statusIndex,options,customArgs,groupURL,msg){
    jsonList = msg;
    //console.log(jsonList.members);
    
    if(options && options.tag){
        if(loadStatus[statusIndex].complete == true) return;
        initializeCollection(statusIndex,options,customArgs,groupURL,jsonList);
    }

    var count = 0;
    for(var obj in jsonList.members){
        if(count>=loadStatus[statusIndex].count){
            var URL = "https://"+ groupURL.split("/")[2]+"/data/" + obj + ".json";
            //console.log(URL);
            $.getJSON(URL,function(msg){getEntryCallback(statusIndex,options,customArgs,groupURL,jsonList,msg);});
        }
        count++;
        loadStatus[statusIndex].count=count;
    }
    loadStatus[statusIndex].complete = true;
}

// callback function for pulling JSON file, run code related to it in HERE ONLY
function getEntryCallback(statusIndex,options,customArgs,groupURL,groupMSG,msg) {
    var jsonObj = msg;
    //console.log(jsonObj);
    
    if(!options){
        options = {};
    }
    
    options.tag = options.tag || jsonObj.birth_certificate.type || "Feature"+(featureCollections.length+1);
    
    console.log(options.tag+": get");
    
    initializeCollection(statusIndex,options,customArgs,groupURL,groupMSG);
    
    if(!options.filter || (options.filter && options.filter(jsonObj))){
        
        //var feature = CKtoGeoJSON(jsonObj);
        //var layer = L.geoJson(feature,customArgs);
        //featureCollections[options.tag].addLayer(layer);
        //saveFeature(featureCollections[options.tag],feature,layer);
        
        featureCollections[options.tag].addData(CKtoGeoJSON(jsonObj));
    }
}

function initializeCollection(statusIndex,options,customArgs,groupURL,groupMSG){
    var tag = options.tag;
    if(!featureCollections.hasOwnProperty(tag)){
        customArgs = customArgs || {};
        
        var originalOnEachFeature = customArgs.onEachFeature;
        customArgs.onEachFeature = function(feature,layer){
            saveFeature(featureCollections[tag],feature,layer);
            if(originalOnEachFeature){
                originalOnEachFeature(feature,layer);
            }
        }
        
        featureCollections[tag]=L.geoJson(null,customArgs);
        
        var originalOnAdd = featureCollections[tag].onAdd;
        featureCollections[tag].onAdd = function(map){
            //Continue Loading 
            finishGetEntries(statusIndex,options,customArgs,groupURL,groupMSG);
            originalOnAdd.call(featureCollections[tag],map);
        }
        
        layerController.addOverlay(featureCollections[tag],tag);
        
        return true;
    }
    return false;
}



