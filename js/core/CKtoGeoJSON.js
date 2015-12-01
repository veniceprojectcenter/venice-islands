//Take a JSON object from the CK console and return a valid GeoJSON object with the same information.
function CKtoGeoJSON(CKjson){
    
    //Create an empty GeoJSON object to be filled with data and returned
    var geoJson={
        type: "Feature",
        geometry: {},
        properties:{}
    };
    
    //If the CKobject is already a valid GeoJSON object, simply use it.
    if(isValidGeoJson(CKjson)==true){
        geoJson = CKjson;
    }
    //if the CK object has a shape or geometry field, use this as the geometry of the GeoJSON object
    else if(CKjson.shape || CKjson.geometry){
        geoJson.geometry = CKjson.shape||CKjson.geometry;
        //All fields not in shape/geometry go into the properties of the GeoJSON object
        for(property in CKjson){
            if(Object.prototype.hasOwnProperty.call(CKjson, property)){
                if(property != "shape" && property != "geometry"){
                    geoJson.properties[property]=CKjson[property];
                }
            }
        }
    }
    //If there is no shape but there is data, look through data for Lat/Long fields.
    else if(CKjson.data){
        geoJson.geometry["type"]="Point";
        geoJson.geometry["coordinates"] = findLonLat(CKjson.data);
        //Then add all fields to properties
        for(property in CKjson){
            if(Object.prototype.hasOwnProperty.call(CKjson, property)){
                if(property != "shape" && property != "geometry"){
                    geoJson.properties[property]=CKjson[property];
                }
            }
        }
    }
    //If there is no shape and no data, look through the object for Lat/Long fields.
    else{
        geoJson.geometry["type"]="Point";
        geoJson.geometry["coordinates"] = findLonLat(CKjson.data);
        //Then add all fields to properties
        for(property in CKjson){
            if(Object.prototype.hasOwnProperty.call(CKjson, property)){
                if(property != "shape" && property != "geometry"){
                    geoJson.properties[property]=CKjson[property];
                }
            }
        }
    }
        
    //add list of all islands associated with this oject to the properties
    geoJson.properties.islands = new Array(0);
    //search through properties of the newly created GeoJSON object to find Islands.
    Array.prototype.push.apply(geoJson.properties.islands,findIslands(geoJson.properties));
    
    if(geoJson.properties.islands.length === 0){
        Array.prototype.push.apply(geoJson.properties.islands,queryIslands_LAYER(islands_layer,geoJson));
//        if(singleLayer){
//            Array.prototype.push.apply(geoJson.properties.islands,queryIslands_JSON(singleLayer,geoJson));
//        }
//        if(multiLayer){
//            Array.prototype.push.apply(geoJson.properties.islands,queryIslands_JSON(multiLayer,geoJson));
//        }
    }
    
    //TODO: ??? IF STILLL no islands, find nearest Island/Islands??? (nearest to each point if a polygon)
    
    geoJson.visible = true;
    geoJson.visible_changed = false;
    
    //console.log(geoJson);
    return geoJson;
}

function nearestIsland(islands_geoJson,point){
    var min = null, island;
    for(var i=0;i<islands_geoJson.features.length;i++){
        var islandGeom = islands_geoJson.features[i].geometry;
        if(islandGeom.type === "Polygon"){
            var dist = distToPolySquared(coordsToPoly(islandGeom.coordinates),coordsToPoint(point));
            if(!min || dist<min){
                min=dist;
                island = islands_geoJson.features[i].properties.Numero;
            }
        }
        else if(islandGeom.type === "MultiPolygon"){
            for(var n = 0; n<island.coordinates.length;n++){
                var dist = distToPolySquared(coordsToPoly(islandGeom.coordinates[n]),coordsToPoint(point));
                if(!min || dist<min){
                    min=dist;
                    island = islands_geoJson.features[i].properties.Numero;
                }
            }
        }
    }
    return island;
}

function queryIslands_JSON(islands_geoJson,obj_geoJson){
    var output = new Array(0);
    
    for(var i=0;i<islands_geoJson.features.length;i++){
        if(queryIsland(islands_geoJson.features[i],obj_geoJson)){
            if(output.indexOf(islands_geoJson.features[i].properties.Numero)<0){
                output.push(islands_geoJson.features[i].properties.Numero);
            }
        }
    }
    return output;
}

function queryIslands_LAYER(islands_geoLayer,obj_geoJson){
    var output = new Array(0);
    
    islands_geoLayer.eachLayer(function(layer){
        if(queryIsland(layer.feature,obj_geoJson)){
            if(output.indexOf(layer.feature.properties.Numero)<0){
                output.push(layer.feature.properties.Numero);
            }
        }
    });
    
//    for(var i=0;i<islands_geoJson.features.length;i++){
//        if(queryIsland(islands_geoJson.features[i],obj_geoJson)){
//            if(output.indexOf(islands_geoJson.features[i].properties.Numero)<0){
//                output.push(islands_geoJson.features[i].properties.Numero);
//            }
//        }
//    }
    return output;
}

function queryIsland(island_geoJson,obj_geoJson){
    var islandGeom = island_geoJson.geometry || islands_geoJson;
    var objGeom = obj_geoJson.geometry || obj_geoJson;
    
    if(islandGeom.type === "Polygon"){
        if(objGeom.type === "Point"){
            return pointInPoly(coordsToPoint(objGeom.coordinates),coordsToPoly(islandGeom.coordinates));
        }
        else if(objGeom.type === "MultiPoint"){
            for(var i=0;i<objGeom.coordinates.length;i++){
                if(pointInPoly(coordsToPoint(objGeom.coordinates[i]),coordsToPoly(islandGeom.coordinates))){
                    return true;
                }
            }
            return false;
        }
        else if(objGeom.type === "Polygon"){
            return polyInterset(coordsToPoly(objGeom.coordinates),coordsToPoly(islandGeom.coordinates));
        }
        else if(objGeom.type === "MultiPolygon"){
            for(var i=0;i<objGeom.coordinates.length;i++){
                if(polyInterset(coordsToPoly(objGeom.coordinates[i]),coordsToPoly(islandGeom.coordinates))){
                    return true;
                }
            }
            return false;
        }
    }
    else if(islandGeom.type === "MultiPolygon"){
        if(objGeom.type === "Point"){
            for(var i=0;i<islandGeom.coordinates.length;i++){
                if(pointInPoly(coordsToPoint(objGeom.coordinates),coordsToPoly(islandGeom.coordinates[i]))){
                    return true;
                }
            }
        }
        else if(objGeom.type === "MultiPoint"){
            for(var i=0;i<islandGeom.coordinates.length;i++){
                for(var i2=0;i2<objGeom.coordinates.length;i2++){
                    if(pointInPoly(coordsToPoint(objGeom.coordinates[i2]),coordsToPoly(islandGeom.coordinates[i]))){
                        return true;
                    }
                }
            }
            return false;
        }
        else if(objGeom.type === "Polygon"){
            for(var i=0;i<islandGeom.coordinates.length;i++){
                if(polyInterset(coordsToPoly(objGeom.coordinates),coordsToPoly(islandGeom.coordinates[i]))){
                    return true;
                }
            }
        }
        else if(objGeom.type === "MultiPolygon"){
            for(var i=0;i<islandGeom.coordinates.length;i++){
                for(var i2=0;i2<objGeom.coordinates.length;i2++){
                    if(polyInterset(coordsToPoly(objGeom.coordinates[i2]),coordsToPoly(islandGeom.coordinates[i]))){
                        return true;
                    }
                }
            }
            return false;
        }
    }
    return false
}
    
function coordsToPoint(coordinates){
    if(coordinates.x && coordinates. y){
        return coordinates;
    }
    return {
        x: coordinates[0],
        y: coordinates[1]
    }
}
function coordsToPoly(coordinates){
    var output = new Array(0);
    
    if(coordinates.length>1){
        for(var i=0;i<coordinates.length;i++){
            output.push(coordsToPoint(coordinates[i]));
        }
    }
    else if(coordinates.length == 1){
        return coordsToPoly(coordinates[0]);
    }
    return output;
}

function findIslands(obj){
    var output = new Array(0);
    
    if(!obj){
        return output;
    }
    
    for(property in obj){
        if(Object.prototype.hasOwnProperty.call(obj, property)){
            if(stringContains((property.toString()).toUpperCase(),"ISLAND")||
                   stringContains((property.toString()).toUpperCase(),"ISOLA")){
                if (obj[property].constructor === Array){
                    for(var i=0;i<obj[property].length;i++){
                        if(isInt(obj[property])&&(output.indexOf(obj[property])<0)){
                            output.push(obj[property][i]);
                        }
                    }
                    
                }
                else if(isInt(obj[property])&&(output.indexOf(obj[property])<0)){
                    output.push(obj[property]);
                }
            }
            else if(typeof obj[property] === 'object'){
                var array = findIslands(obj[property]);
                output = mergeArrays(output,array);
            }
        }
    }
    return output;
}

function findLonLat(obj){
    var lon = null,lat = null;
    
    if(!obj){
        return [lon,lat];
    }
    
    for(property in obj){
        if(Object.prototype.hasOwnProperty.call(obj, property)){
            if(typeof obj[property] === 'object'){
                var LonLat = findLonLat(obj[property]);
                if(!lon && LonLat[0]){
                    lon=LonLat[0];
                }
                if(!lat && LonLat[1]){
                    lat=LonLat[1];
                }
            }
            else{
                if(stringContains((property.toString()).toUpperCase(),"LATITUDE")){
                    lat = obj[property];
                }
                else if(stringContains((property.toString()).toUpperCase(),"LONGTITUDE")||stringContains((property.toString()).toUpperCase(),"LONGITUDE")){
                    lon = obj[property];
                }
            }
        }
    }
    if(parseFloat(lon) && parseFloat(lat))
        return [parseFloat(lon),parseFloat(lat)];
}
    
function isInt(value) {
  var x;
  if (isNaN(value)) {
    return false;
  }
  x = parseFloat(value);
  return (x | 0) === x;
}

function mergeArrays(a1,a2){
    return a1.concat(a2.filter(function(item){
        return a1.indexOf(item)<0;
    }));
}

function stringContains(outerString,innerString){
    return outerString.indexOf(innerString) > -1;
}

function isValidGeoJson(jsonObj){
    if(jsonObj.type){
        if(jsonObj.type=="FeatureCollection"){
            if(jsonObj.hasOwnProperty("features")){
                for(var i=0;i<jsonObj.features.length;i++){
                    if(!isValidGeoJson(jsonObj.features[i])){
                        return false;
                    }
                }
                return true;
            }
        }
        else if(jsonObj.type == "Feature"){
            if(jsonObj.hasOwnProperty("geometry")&&jsonObj.hasOwnProperty("properties")){
                if(!isValidGeoJsonGeometry(jsonObj.geometry)){
                    return false;
                }
                return true;
            }
        }
        else{
            return isValidGeoJsonGeometry(jsonObj)
        }
    }
    return false;
}
    
function isValidGeoJsonGeometry(jsonObj){
    if(jsonObj.type){
        
        if(jsonObj.type == "GeometryCollection"){
            if(jsonObj.hasOwnProperty("geometries")){
                for(var i=0;i<jsonObj.geometries.length;i++){
                    if(!isValidGeoJsonGeometry(jsonObj.geometries[i])){
                        return false;
                    }
                }
                return true;
            }
        }
        else if(jsonObj.type == "Point"){
            if(jsonObj.hasOwnProperty("coordinates")){
                return isValidGeoJsonPosition(jsonObj.coordinates);
            }
        }
        else if(jsonObj.type == "MultiPoint"){
            if(jsonObj.hasOwnProperty("coordinates")){
                return isValidGeoJsonCoordinates(jsonObj.coordinates);
            }
        }
        else if(jsonObj.type == "LineString"){
            if(jsonObj.hasOwnProperty("coordinates")){
                if(!isValidGeoJsonCoordinates(jsonObj.coordinates)){
                    return false;
                }
                return jsonObj.coordinates.length>1;
            }
        }
        else if(jsonObj.type == "MultiLineString"){
            if(jsonObj.hasOwnProperty("coordinates")){
                for(var i=0;i<jsonObj.coordinates.length;i++){
                    if(!isValidGeoJsonCoordinates(jsonObj.coordinates)){
                        return false;
                    }
                    if(jsonObj.coordinates.length<2){
                        return false;
                    }
                }
                return true;
            }
        }
        else if(jsonObj.type == "Polygon"){
            if(jsonObj.hasOwnProperty("coordinates")){
                if(!isValidGeoJsonLinearRing(jsonObj.coordinates)){
                    return false;
                }
                return true;
            }
        }
        else if(jsonObj.type == "MultiPolygon"){
            if(jsonObj.hasOwnProperty("coordinates")){
                for(var i=0;i<jsonObj.coordinates.length;i++){
                    if(!isValidGeoJsonLinearRing(jsonObj.coordinates)){
                        return false;
                    }
                }
                return true;
            }
        }
    }
    return false;
}

function isValidGeoJsonLinearRing(jsonObj){
    if(!isValidGeoJsonCoordinates(jsonObj)){
        return false;
    }
    if(jsonObj.length<4){
        return false;
    }
    if(jsonObj[0]==jsonObj[jsonObj.length-1]){
        return true;
    }
    return false;
}

function isValidGeoJsonCoordinates(jsonObj){
    for(var i=0;i<jsonObj.length;i++){
        if(!isValidGeoJsonPosition(jsonObj[i])){
            return false;
        }
    }
    return true;
}

function isValidGeoJsonPosition(jsonObj){
    return jsonObj.length<1;
}