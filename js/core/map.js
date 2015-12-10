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
    layer.setStyle(Highlight_style(layer.feature));
}

function resetHighlight(e) {
    var layer = e.target;
    // console.log(e.target);
        
    if(islands_layer.hasLayer(e.target)){
        islands_layer.resetStyle(e.target)
    }
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
    var currentLayer = e.target;
    overlay(currentLayer);
}

//function saveAndHighlight(parent, feature, layer) {
//    saveFeature(parent, feature, layer)
//    setupHighlight(feature,layer);
//}

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
    var originalEvents = layer.on;
    layer.on({
        mouseover: function(e){
            if(originalEvents.mouseover){
                originalEvents.mouseover(e);
            }
            highlightFeature(e);
        },
        mouseout: function(e){
            if(originalEvents.mouseout){
                originalEvents.mouseout(e);
            }
            resetHighlight(e);
        },
        dblclick: function(e){
            if(originalEvents.dblclick){
                originalEvents.dblclick(e);
            }
            zoomToFeature(e)
        }
    });
}

function setupGeneralInfo(infoHtml,feature,layer){
    var originalEvents = layer.on;
    layer.on({
        mouseover: function(e){
            if(originalEvents.mouseover){
                originalEvents.mouseover(e);
            }
            mapInfo.update(infoHtml);
        },
        mouseout: function(e){
            if(originalEvents.mouseout){
                originalEvents.mouseout(e);
            }
            mapInfo.update();
        }
    });
}

//**********************************************************************************************

// add base geojson to map with islands data
var islands_layer = L.geoJson(null, {
    style: Island_style,
    onEachFeature: function(feature,layer){
        saveFeature(islands_layer,feature,layer);
        setupHighlight(feature,layer);
        if(islands_layer.islandOptions.generalInfo){
            setupGeneralInfo(islands_layer.islandOptions.generalInfo(feature.properties),feature,layer);
        }
    }
    //onEachFeature: partial(saveAndHighlight,islands_layer)
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

mapInfo.update = function (html) {
    this._div.innerHTML = '<h4>General Information</h4>';
    if(html && html !=''){
        $(this._div).append(html);
    }
    else{
        $(this._div).append('Hover over a feature <br /> Double click for more info');
    }
    
};

mapInfo.addTo(map);

//**********************************************************************************************
// add location functionality
// set this to true to auto-zoom on your location
map.locate({setView: false, maxZoom: 18, watch:true});

markerFlag = false;
// create a global var for the location layer - must be global so it can be toggled
var locationLayer = L.layerGroup().addTo(map); 
var locationMarker, locationRadius, locationGeoJSON;

// function to excecute when the user's location is found
function onLocationFound(e) {
    //console.log("added new marker");
    // close old current location marker if it's outdated
    if (markerFlag==true){
        map.removeLayer(locationMarker);
        map.removeLayer(locationRadius);
    }
    
    var radius = e.accuracy / 2;
    
    // Create a marker with a popup at the location 
    locationMarker =  L.marker(e.latlng);
        //.bindPopup("You are within " + radius + " meters from this point").openPopup();

    // Create an additional circle showing the approximate radius
    locationRadius = L.circle(e.latlng, radius, {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5 
    });
    
    // add the marker and popup to the location layer
    locationLayer.addLayer(locationMarker);
    locationLayer.addLayer(locationRadius);
    if (markerFlag == false) markerFlag = true;

    locationGeoJSON = locationMarker.toGeoJSON();
    var nearestIsles = queryIslands_COLLECTION(islandsCollection,locationGeoJSON,true);
    
//  locationMarker.bindPopup("<center><b>Nearest Features</b><br>Within " + radius + " meters </center>" + '</br>' + getOverlayInfo(nearestIsles));
   
    
    //console.log(nearestIsles);
    locationMarker.on('click', function(){
        var bodyString = getOverlayInfo(nearestIsles);
        if(bodyString!='') overlayHTML('Nearest Features','<b><center> Island of ' + islandsCollection[nearestIsles[0]].properties.Nome_Isola +'</b></center>'+ bodyString);
        else if(nearestIsles.length>0) overlayHTML('Nearest Features','<b><center>Island of ' +islandsCollection[nearestIsles[0]].properties.Nome_Isola + '</b></center></br>No additional features found');
        else{
            overlayHTML('Nearest Features','No features found');
        }
    });
    
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
    
    var vpcSpan = document.createElement("SPAN");
    vpcSpan.innerHTML = '<img src="image/about.png"  style="cursor:pointer;padding-right:7px;">';
    vpcSpan.onclick = showAbout;
    
    this._div.appendChild(vpcSpan);
    
    var vpcLogo = document.createElement("A");
    vpcLogo.innerHTML = '<img src="image/vpc25logo.png">';
    vpcLogo.href = "http://veniceprojectcenter.org";
    vpcLogo.target ="_blank";
    
    this._div.appendChild(vpcLogo);
    
    return this._div;
};

function showAbout(){
    var el = document.getElementById("help");
	el.style.visibility = "visible";
    //$(document.getElementById("innerHelp")).append('<div class="floatingX" onclick = "hideAbout()" ></div>');
    document.getElementById("innerHelp").innerHTML = 
        '<a id="helpX" onclick = "hideAbout()" class = "Xbutton">Close Window</a>'+
        '<iframe id=helpContent scrolling="yes" src="https://docs.google.com/document/d/11a5uMYyAtVFpasV2QbwML8ftwQgKn9n_pIhnUJoiBo8/pub?embedded=true"></iframe>';
    $('#help').on('click', function(event) {
        if (!$(event.target).closest('#innerHelp').length) {
            hideAbout();
        }
    });
}
function hideAbout(){
    var el = document.getElementById("help");
    el.style.visibility = "hidden";
}

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
};

//*******************************************************************************************

function objHasPropertyEqualTo(object,property,value){
    if(typeof object == 'object'){
        for(key in object){
            if(object.hasOwnProperty(key)){
                if(key==property){
                    if(object[key]==value){return true;};
                }
                else if(objHasPropertyEqualTo(object[key],property,value)) return true;
            }
        }
    }
    return false;
};

function findFeature_Layer(key,value){
    for(var i=0,iLen=feature_layers.length;i<iLen;i++){
        if(objHasPropertyEqualTo(feature_layers[i].feature.properties,key,value)){
            return feature_layers[i];
        }
    }
};

function findIslandLayer(key,value){
    var layers = []
    islands_layer.eachLayer(function(layer){
        if(objHasPropertyEqualTo(layer.feature.properties,key,value)){
            console.log(layer);
            layers.push(layer);
        }
    });
    return layers[0];
};

function findTagLayer(tag,key,value){
    var layers = []
    featureCollections[tag].eachLayer(function(layer){
        if(objHasPropertyEqualTo(layer.feature.properties,key,value)){
            layers.push(layer);
        }
    });
    return layers[0];
}

function findLayer(tag,key,value){
    if(!tag){
        return findFeature_Layer(key,value).layer;
    }
    else if(tag == 'island'){
        return findIslandLayer(key,value)
    }
    else{
        return findTagLayer(tag,key,value);
    }
}

//*******************************************************************************************

//Save the loading status of every data group added
//array of vars. var = {sendCount,sendComplete,maxCount,recieveCount,recieveComplete,function onInitialize(tag),function onRecieveComplete(tag)}
var loadStatus = [];

function getGroupCallback(options,customArgs,groupURL,groupMSG) {
    options = options || {};
    if(!options.hasOwnProperty("preLoad")){
        options.preLoad=false;
    }
    if(!options.hasOwnProperty("toggle")){
        options.toggle=true;
    }
    
    var jsonList = groupMSG;
    //console.log(jsonList.members);
    var statusIndex = loadStatus.length;
    loadStatus.push({});
    
    loadStatus[statusIndex].sendCount = 0;
    loadStatus[statusIndex].recieveCount = 0;
    loadStatus[statusIndex].onRecieveComplete = function(tag){};
    loadStatus[statusIndex].onInitialize = function(tag){
        var params = getUrlParameters();
        
        if(params.layerTag && params.layerTag == tag){
            loadStatus[statusIndex].onRecieveComplete = function(){
                for(key in params){
                    if(params.hasOwnProperty(key)&&key!='layerTag'){
                        var layer = findLayer(params.layerTag,key,params[key]);
                        console.log(layer);
                        if(layer){
                            if(layer.getBounds)
                                map.fitBounds(layer.getBounds());
                            else if(layer.getLatLng){
                                map.setView(layer.getLatLng(),25)
                            }
                            return;
                        }
                    }
                }
            }
            featureCollections[tag].addTo(map);
        }
    };
    
    if(options.tag){
        initializeCollection(statusIndex,options,customArgs,groupURL,jsonList);
    }
    
    if(featureCollections[options.tag]){
        loadStatus[statusIndex].recieveComplete = false;
        return;
    }
    
    var count = 0;
    for(var obj in jsonList.members){
        if(count == 0){
            getNextEntry(statusIndex,options,customArgs,groupURL,jsonList);
        }
        count++;
    }
    loadStatus[statusIndex].maxCount = count;
};

function getNextEntry(statusIndex,options,customArgs,groupURL,groupMSG){
    var jsonList = groupMSG;
    //console.log(jsonList.members);
    
    if(options && options.tag){
        if(loadStatus[statusIndex].sendComplete == true) return;
        initializeCollection(statusIndex,options,customArgs,groupURL,jsonList);
    }

    var count = 0;
    for(var obj in jsonList.members){
        if(count>=loadStatus[statusIndex].sendCount){
            var URL = "https://"+ groupURL.split("/")[2]+"/data/" + obj + ".json";
            //console.log(URL);
            $.getJSON(URL,function(msg){getEntryCallback(statusIndex,options,customArgs,groupURL,jsonList,msg);});
            count++;
            loadStatus[statusIndex].sendCount=count;
            return false;
        }
    }
    loadStatus[statusIndex].sendComplete = true;
    return true;
};

function finishGetEntries(statusIndex,options,customArgs,groupURL,msg){
    var jsonList = msg;
    //console.log(jsonList.members);
    
    if(options && options.tag){
        if(loadStatus[statusIndex].sendComplete == true) return;
        initializeCollection(statusIndex,options,customArgs,groupURL,jsonList);
    }

    var count = 0;
    for(var obj in jsonList.members){
        if(count>=loadStatus[statusIndex].sendCount){
            var URL = "https://"+ groupURL.split("/")[2]+"/data/" + obj + ".json";
            //console.log(URL);
            //$.getJSON(URL,function(msg){getEntryCallback(statusIndex,options,customArgs,groupURL,jsonList,msg);});
            $.ajax({
                dataType: "json",
                url: URL,
                success: function(msg){
                    getEntryCallback(statusIndex,options,customArgs,groupURL,jsonList,msg);
                },
                complete: function(){
                    loadingScreen.remove();
                    loadStatus[statusIndex].recieveCount++;
                    if(loadStatus[statusIndex].recieveCount>=loadStatus[statusIndex].sendCount){
                        loadStatus[statusIndex].recieveComplete=true;
                        loadStatus[statusIndex].onRecieveComplete(options.tag);
                    }
                },
                beforeSend: function(){
                    loadingScreen.add();
                    loadStatus[statusIndex].sendCount++;
                }
            });
        }
        count++;
    }
    loadStatus[statusIndex].sendComplete = true;
};

// callback function for pulling JSON file, run code related to it in HERE ONLY
function getEntryCallback(statusIndex,options,customArgs,groupURL,groupMSG,msg) {
    var jsonObj = msg;
    //console.log(jsonObj);
    
    if(!options || typeof options != 'object'){
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
        
        try {
            featureCollections[options.tag].addData(attachIslands(CKtoGeoJSON(jsonObj),options.useNearest));
        }
        catch(err) {
            console.error("Could Not Make Valid GeoJSON from CK Data:");
            console.log(jsonObj);
        }
    }
};

function initializeCollection(statusIndex,options,customArgs,groupURL,groupMSG){
    var tag = options.tag;
    if(!featureCollections.hasOwnProperty(tag)){
        
        customArgs = customArgs || {};
        
        var originalOnEachFeature = customArgs.onEachFeature;
        customArgs.onEachFeature = function(feature,layer){
            saveFeature(featureCollections[tag],feature,layer);
            if(options.generalInfo){
                setupGeneralInfo(options.generalInfo(feature.properties),feature,layer);
            }
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
        
        featureCollections[tag].groupOptions = options;
        
        if(!options.preLoad){
            layerController.addOverlay(featureCollections[tag],tag);
        }
        
        loadStatus[statusIndex].onInitialize(tag);
        
        if(options.preLoad == true){
            featureCollections[tag].addTo(map);
        }
        
        return true;
    }
    return false;
};



