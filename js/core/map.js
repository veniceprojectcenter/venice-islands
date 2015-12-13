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
    attribution: 'Map &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.run-bike-hike'
}).addTo(map);

var satelliteLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/mapbox.streets-satellite/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IjZjNmRjNzk3ZmE2MTcwOTEwMGY0MzU3YjUzOWFmNWZhIn0.Y8bhBaUMqFiPrDRW9hieoQ', {
    maxZoom: 20, minZoom: 10,
    attribution: 'Map &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.streets-satellite'
});

var basicLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/mapbox.outdoors/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IjZjNmRjNzk3ZmE2MTcwOTEwMGY0MzU3YjUzOWFmNWZhIn0.Y8bhBaUMqFiPrDRW9hieoQ', {
    maxZoom: 20, minZoom: 10,
    attribution: 'Map &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>, ' +
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

function zoomToIsland(e) {
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
            zoomToIsland(e);
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
markerFlag = false;
// create a global var for the location layer - must be global so it can be toggled
var locationLayer = L.layerGroup();

var prevOnAdd = locationLayer.onAdd;
var prevOnRemove = locationLayer.onRemove;

locationLayer.onAdd = function(Imap){
    if(prevOnAdd){
        prevOnAdd.call(locationLayer,Imap);
    }
    map.locate({setView: false, maxZoom: 18, watch:true});
}
locationLayer.onRemove = function(Imap){
    if(prevOnRemove){
        prevOnRemove.call(locationLayer,Imap);
    }
    map.stopLocate();
}

var locationMarker, locationRadius, locationGeoJSON;

// function to excecute when the user's location is found
function onLocationFound(e) {
    //console.log("added new marker");
    // close old current location marker if it's outdated
    if (markerFlag==true){
        if(locationLayer.hasLayer(locationMarker)){
            locationLayer.removeLayer(locationMarker);
        }
        if(locationLayer.hasLayer(locationRadius)){
            locationLayer.removeLayer(locationRadius);
        }
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
    markerFlag = true;

    locationGeoJSON = locationMarker.toGeoJSON();
    var nearestIsles = queryIslands_COLLECTION(islandsCollection,locationGeoJSON,true);
    
//  locationMarker.bindPopup("<center><b>Nearest Features</b><br>Within " + radius + " meters </center>" + '</br>' + getOverlayInfo(nearestIsles));
   
    
    //console.log(nearestIsles);
    locationMarker.on('click', function(){
        var bodyString = getOverlayInfo(nearestIsles);
        if(bodyString!='') overlayHTML('Nearest Features','<a id="location"><b><center> Island of ' + islandsCollection[nearestIsles[0]].properties.Nome_Isola +'</b></center>'+ bodyString+'</a>');
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

// add in layer control so that you can toggle the layers
var layerController = L.control.layers(baseMaps,{}).addTo(map);
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
    var layers = [];
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

function loadStateFromURL(){
    var params = getUrlParameters();
    for(key in params){
        if(params.hasOwnProperty(key)&&key!='layerTag'){
            var layer = findLayer(params.layerTag,key,params[key]);
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
//*******************************************************************************************

//Save the loading status of every data group added
//array of vars. var = {tag,sendCount,sendComplete,maxCount,recieveCount,recieveComplete,initComplete,function onInitialize(tag),function onRecieveComplete(tag)}
var loadStatus = [];
//once tag is determined, stro the index here so you can find status index using tag
var loadStatusIndex = {};

function getGroupCallback(options,customArgs,groupURL,groupMSG) {
    //if no options are given, initialize options as an empty object with default values
    options = options || {};
    if(!options.hasOwnProperty("preLoad")){
        options.preLoad=false;
    }
    if(!options.hasOwnProperty("toggle")){
        options.toggle=true;
    }
    
    var jsonList = groupMSG;
    
    //Initialize object to store load statuses 
    var statusIndex = loadStatus.length;
    loadStatus.push({});
    
    //Initialize loadStatus for this group
    loadStatus[statusIndex].tag = undefined;
    loadStatus[statusIndex].sendCount = 0;
    loadStatus[statusIndex].sendComplete = false;
    loadStatus[statusIndex].recieveCount = 0;
    loadStatus[statusIndex].recieveComplete = false;
    loadStatus[statusIndex].onRecieveComplete = function(tag){};
    loadStatus[statusIndex].initComplete = false;
    //Once group is initialized (Final tag is determined)
    loadStatus[statusIndex].onInitialize = function(tag){
        //save index using final tag
        loadStatusIndex[tag] = statusIndex;
        loadStatus[statusIndex].tag = tag;
        loadStatus[statusIndex].initComplete = true;
        
        var params = getUrlParameters();
        
        //If this group's tag matches the URL parameter
        if(params.layerTag && params.layerTag == tag){
            //setup the OnRecieveComplete Functin for zooming to the feature
            loadStatus[statusIndex].onRecieveComplete = loadStateFromURL;
            //add the group to map to initialize loading
            featureCollections[tag].addTo(map);
        }
    };
    
    //If we have the tag, collection can be initialized
    if(options.tag){
        initializeCollection(statusIndex,options,customArgs,groupURL,jsonList);
    }
    
    var count = 0;
    //iterate throght the list once so we can save the total number of entries
    for(var obj in jsonList.members){
        //if group has not been initialized, load the 1st object so we can find the tag
        if(count == 0 && !loadStatus[statusIndex].initComplete){
            getNextEntry(statusIndex,options,customArgs,groupURL,jsonList);
        }
        count++;
    }
    //save the total number of entries
    loadStatus[statusIndex].maxCount = count;
};

function getNextEntry(statusIndex,options,customArgs,groupURL,groupMSG){
    var jsonList = groupMSG;
    //console.log(jsonList.members);
    
    //If done sending requests, return
    if(loadStatus[statusIndex].sendComplete == true) return;
    
    //if we know the tag, try to initialize (initialize does nothing if group is already initialized)
    if(options && options.tag){
        initializeCollection(statusIndex,options,customArgs,groupURL,jsonList);
    }

    var count = 0;
    //Iterate through the members
    for(var obj in jsonList.members){
        //if we found the next member to load, load it
        if(count>=loadStatus[statusIndex].sendCount){
            var URL = "https://"+ groupURL.split("/")[2]+"/data/" + obj + ".json";
            //$.getJSON(URL,function(msg){getEntryCallback(statusIndex,options,customArgs,groupURL,jsonList,msg);});
            $.ajax({
                dataType: "json",
                url: URL,
                success: function(msg){
                    getEntryCallback(statusIndex,options,customArgs,groupURL,jsonList,msg);
                },
                complete: function(){
                    //update load status on recieve
                    loadStatus[statusIndex].recieveCount++;
                    //if recieced = sent, we must be done!
                    if(loadStatus[statusIndex].recieveCount>=loadStatus[statusIndex].sendCount){
                        loadStatus[statusIndex].recieveComplete=true;
                        loadStatus[statusIndex].onRecieveComplete(options.tag);
                    }
                },
                beforeSend: function(){
                    //Increment loading counter before sending
                    loadStatus[statusIndex].sendCount++;
                }
            });
            //return false because there may be more items to load
            return false;
        }
        else{
            count++;
        }
    }
    //all messages sent, return true
    loadStatus[statusIndex].sendComplete = true;
    return true;
};

function finishGetEntries(statusIndex,options,customArgs,groupURL,msg){
    var jsonList = msg;
    //console.log(jsonList.members);
    
    //If done sending requests, return
    if(loadStatus[statusIndex].sendComplete == true) return;
    
    //if we know the tag, try to initialize (initialize does nothing if group is already initialized)
    if(options && options.tag){
        initializeCollection(statusIndex,options,customArgs,groupURL,jsonList);
    }

    var count = 0;
    for(var obj in jsonList.members){
        //if we see a member we have not yet requested, request it
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
                    //decrement loading counter after sending
                    loadingScreen.remove();
                    //update load status on recieve
                    loadStatus[statusIndex].recieveCount++;
                    //if recieced = sent, we must be done!
                    if(loadStatus[statusIndex].recieveCount>=loadStatus[statusIndex].sendCount){
                        loadStatus[statusIndex].recieveComplete=true;
                        loadStatus[statusIndex].onRecieveComplete(options.tag);
                    }
                },
                beforeSend: function(){
                    //Increment loading counter before sending
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
    
    //ensure options is an object and is initialized
    if(!options || typeof options != 'object'){
        options = {};
    }
    
    //Determine layerTag
    options.tag = options.tag || jsonObj.birth_certificate.type || "Feature"+(featureCollections.length+1);
    
    //Let us know stuff is happening
    console.log(options.tag+": get");
    
    //Initialize Collection (if already initialized, this function does nothing)
    initializeCollection(statusIndex,options,customArgs,groupURL,groupMSG);
    
    //if this object passes the filter function from groupOptions
    if(!options.filter || (options.filter && options.filter(jsonObj))){
        //try to make a geoJSON from the object. This fails if the object has no geometry, so surround in Try Catch to stop stuff from breaking
        try {
            featureCollections[options.tag].addData(attachIslands(CKtoGeoJSON(jsonObj),options.useNearest));
        }
        catch(err) {
            console.groupCollapsed("Could Not Make Valid GeoJSON from CK Data:");
            console.groupCollapsed("Rejected Object:")
            console.log(jsonObj);
            console.groupEnd();
            console.groupCollapsed("Error Thrown:");
            console.log(err);
            console.groupEnd();
            console.groupEnd();
        }
    }
};

//Set up the group so that the application can use/display it
function initializeCollection(statusIndex,options,customArgs,groupURL,groupMSG){
    var tag = options.tag;
    
    if(!featureCollections.hasOwnProperty(tag)){
        
        customArgs = customArgs || {};
        
        //Add to onEachFeature without overriding existing function
        var originalOnEachFeature = customArgs.onEachFeature;
        customArgs.onEachFeature = function(feature,layer){
            //Save feature in feature_layers
            saveFeature(featureCollections[tag],feature,layer);
            //if generalInfo function is given, setup general Info box for onHover
            if(options.generalInfo){
                setupGeneralInfo(options.generalInfo(feature.properties),feature,layer);
            }
            if(originalOnEachFeature){
                originalOnEachFeature(feature,layer);
            }
        }
        
        featureCollections[tag]=L.geoJson(null,customArgs);
        
        //Add to onAdd without overriding existing function
        var originalOnAdd = featureCollections[tag].onAdd;
        featureCollections[tag].onAdd = function(map){
            //Load the entire layer when it is first added to the map
            finishGetEntries(statusIndex,options,customArgs,groupURL,groupMSG);
            originalOnAdd.call(featureCollections[tag],map);
        }
        
        //save options for this featureCollection so they can be accessd later
        featureCollections[tag].groupOptions = options;
        
        //if toggle option is not given or true, add layer to layerController so user can toggle
        if(options.toggle === undefined || options.toggle){
            layerController.addOverlay(featureCollections[tag],tag);
        }
        
        //call load status initialize function
        loadStatus[statusIndex].onInitialize(tag);
        
        //if preLoad option is true, add to the map now to begin loading immediately
        if(options.preLoad == true){
            featureCollections[tag].addTo(map);
        }
        
        return true;
    }
    return false;
};



