// ~~~~~~~~ Functions for Retrievings Data ~~~~~~~~~~~~~~~~~~~~~

//Add a data set to be displayed on the map!
//options = { tag, filter: boolean function(obj)};
function getGroup(URL,options,customArgs){
    //$.getJSON(URL,partial(getGroupCallback,tag,customArgs,URL));
    $.getJSON(URL,function(msg){getGroupCallback(options,customArgs,URL,msg);});
}

//options = { searchInclude: string[], searchExclude: string[]};
function getIslands(path,options){
    $.getJSON(path,function(msg){
        var layer = msg;

        for(var i=0,iLen=layer.features.length;i<iLen;i++){
            var feature = layer.features[i];
            feature.visible = true;
            islandsCollection[feature.properties.Numero] = feature;
        }
        islands_layer.addData(layer);
        if(!filter.object){
            filter.setObject(layer.features[0].properties);
            filter.minimize(filter.minimized);
        }
        if(!colorControl.object){
            colorControl.setObject(layer.features[0].properties);
            colorControl.minimize(filter.minimized);
        }
        
        if(options){
            if(options.searchInclude){
                searchControl.includeKeys(options.searchInclude);
            }
            if(options.searchExclude){
                searchControl.searchExclude(options.searchExclude);
            }
        }
        
        searchControl.refresh();
        recolorIsles();
    });
}

//***********************************************************************************************
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
getIslands('IslesLagoon_single.geojson',{searchInclude: ['Nome_Isola','Numero']});
getIslands('IslesLagoon_multi.geojson'),{searchInclude: ['Nome_Isola','Numero']};


// ~~~~~~~~~~ layers with maps/working points ~~~~~~~~~~~~~
//var getReq = $.getJSON("https://cityknowledge.firebaseio.com/groups/MAPS%20Bridges.json",getGroupCallback);
getGroup("https://cityknowledge.firebaseio.com/groups/MAPS%20Bridges.json",{tag: "Bridges"},{style: style2, onEachFeature:setupHighlight});
getGroup("https://cityknowledge.firebaseio.com/groups/MAPS%20Canals.json",{tag: "Canals"},{onEachFeature:setupHighlight});
//featureCollections["Canals"].bindPopup("I am a canal");

//getGroup("https://cityknowledge.firebaseio.com/groups/MAPS%20Canal%20Segments.json","Canal Segments",{style: style2});
getGroup("https://cityknowledge.firebaseio.com/groups/belltowers%20MAPS%2015.json",{tag:"Bell Towers"},{style: style2, onEachFeature:setupHighlight,pointToLayer: function(feature,latlng){
    return new L.marker(latlng, {icon: churchIcon}).bindPopup("Hover over for more info")}});
getGroup("https://cityknowledge.firebaseio.com/groups/maps_HOTELS08_PT_15.json",{tag: "HotelsMap"},{pointToLayer: function(feature,latlng){
    return new L.marker(latlng, {icon: hotelIcon}).bindPopup("I am a church");
}});
getGroup("https://cityknowledge.firebaseio.com/groups/maps_HOLES_PT_15.json",{tag: "Sewer Outlets"},{onEachFeature:setupHighlight,pointToLayer: function(feature,latlng){
    return new L.marker(latlng, {icon: sewerIcon}).bindPopup("poop");
}});

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
getGroup("https://cityknowledge.firebaseio.com/groups/Island%20Church%20Data.json",{tag:"Island Churches"},{pointToLayer: function(feature,latlng){
    return new L.marker(latlng, {icon: conventIcon}).bindPopup("I am a church");
}});
//getGroup("https://cityknowledge.firebaseio.com/groups/Convents%20Data.json", "Convents",{pointToLayer: function(feature,latlng){
//    return new L.marker(latlng, {icon: conventIcon}).bindPopup("I am a convent");
//}});

getGroup("https://cityknowledge.firebaseio.com/groups/Minor_Lagoon_Islands_2015.json",{tag:"Wiki Data"},{pointToLayer: function(feature,latlng){
    return new L.marker(latlng, {icon: vpcicon});
}});

// the above layer probably matches up with the images in
//https://cityknowledge.firebaseio.com/groups/convent%20floor%20plans.json"

getGroup("https://ckdata.firebaseio.com/groups/MERGE%20Stores%202012.json",{filter:function(obj){
    if(obj["2015"]) return true;
    
}},{pointToLayer: function(feature,latlng){
    return new L.marker(latlng, {icon: storeIcon}).bindPopup("I am a store");
}});


// ~~~~~~~~ useful datasets not tagged by location ~~~~~~~~
// https://cityknowledge.firebaseio.com/groups/SUBGROUP%20Boat%20Traffic%20Counts%20by%20Station.json
// https://cityknowledge.firebaseio.com/groups/SUBGROUP%20Latest%20Traffic%20Counts%20By%20Station.json

//var poly = new Array({x:0,y:0},{x:2,y:0},{x:2,y:2},{x:0,y:2},{x:0,y:0});
//var point = {x:1,y:1};
//console.log(point);
//console.log(pointInPoly(point,poly));