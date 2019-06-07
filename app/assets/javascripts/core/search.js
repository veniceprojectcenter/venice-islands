var searchLayers = L.layerGroup([islands_layer]);
//var searchLayers = islands_layer;

var searchControl = L.control.search({
    zoom: 15,
    layer: searchLayers,
    propertyName: 'Nome_Isola',
    circleLocation: false,
    collapse: false,
    collapsed: false,
    autoCollapse: false,
    filterData: function(text, records) {
        var jsons = searchControl.fuse.search(text),
            ret = {}, key;

        for(var i in jsons) {
            key = jsons[i].Nome_Isola;
            ret[ key ]= records[key];
        }

        //console.log(jsons,ret);
        return ret;
    }
})
.on('search_locationfound', function(e) {
    map.fitBounds(e.layer.getBounds());
});
    
searchControl.showLocation = function(latlng, title){
        
}

searchControl.fuse = {};
searchControl.keys = [];

searchControl._allKeys = [];
searchControl._includeKeys = [];
searchControl._excludeKeys = [];

searchControl.refresh = function(){

    var islands_features = [];

    islands_layer.eachLayer(function(layer){
        islands_features.push(layer.feature.properties);
    });
    
    islands_features = valsToStrings(islands_features);
    
    searchControl._allKeys = getKeys(islands_features[0]);
    searchControl.keys = searchControl._allKeys;
    
    if(searchControl._includeKeys && searchControl._includeKeys.length>0){
        searchControl.keys = searchControl._allKeys.filter(function(e){
            return searchControl._includeKeys.some(function(key){
                return key.split('.').some(function(sub_key){
                    return e.toLowerCase() == sub_key.toLowerCase();
                });
            });
        });
    }
    else if(searchControl._excludeKeys&& searchControl._excludeKeys.length>0){
        searchControl.keys = searchControl._allKeys.filter(function(e){
            return searchControl._excludeKeys.some(function(key){
                return key.split('.').some(function(sub_key){
                    return e.toLowerCase() == sub_key.toLowerCase();
                });
            });
        });
    }
    
    searchControl.fuse = new Fuse(islands_features, {
        keys: searchControl.keys
    });
};

searchControl.includeKeys = function(strArray){
    searchControl._includeKeys = strArray;
    searchControl.refresh();
};
searchControl.excludeKeys = function(strArray){
    searchControl._excludeKeys = strArray;
    searchControl.refresh();
};

//***************************************************************************************

function getKeys(object){
    var results = [];
    //console.log(object);
    for(key in object){
        if(object[key]!=undefined){
            if(typeof object[key] == 'object'){
                results.concat(getKeys(object[key]).map(function(value){
                    return key +"."+value;
                }).filter(function(value){
                    return results.indexOf(value) == -1;
                }));
            }
            else if(results.indexOf(key)==-1){
                results.push(key);
            }
        }
    }
    return results;
}
function valsToStrings(object){
    if(!object){
        return null;
    }
    
    var output = {};
    if(typeof object == 'object'){
        if(object && object.constructor === Array){
            output = [];
        }
        for(property in object){
            if(object.hasOwnProperty(property)){
                output[property] = valsToStrings(object[property]);
            }
        }
        return output;
    }
    else if(object){
        output = object.toString();
    }
    return output;
}

searchControl.refresh();

searchControl.addTo(map);
searchControl._container.style.clear = 'none';
searchControl._container.style.zIndex = 1010;