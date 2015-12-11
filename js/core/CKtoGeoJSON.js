//Take a JSON object from the CK console and return a valid GeoJSON object with the same information.
//Looks for geometry (points or polygons) --> feature.geometry
//Original Object --> feature.properties
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
        geoJson.geometry["coordinates"] = findLonLat(CKjson);
        //Then add all fields to properties
        for(property in CKjson){
            if(Object.prototype.hasOwnProperty.call(CKjson, property)){
                if(property != "shape" && property != "geometry"){
                    geoJson.properties[property]=CKjson[property];
                }
            }
        }
    }
    
    //attach visibility flags which are used by the filter to show/hide specific layers
    geoJson.visible = true;
    geoJson.visible_changed = false;
    
    return geoJson;
}

//************************
//Spatial Query Functions
//************************

//Add Island information to a geoJSON object
//array of islands will be saved to feature.properties.islands
function attachIslands(geoJson,useNearest){
    
    //add list of all islands associated with this oject to the properties
    geoJson.properties.islands = [];
    
    //search through properties of the GeoJSON object to find Islands.
    Array.prototype.push.apply(geoJson.properties.islands,findIslands(geoJson.properties));
    
    //if no existing island information is found in the object, try to find islands using spatial query
    if(geoJson.properties.islands.length === 0){
        Array.prototype.push.apply(geoJson.properties.islands,queryIslands_COLLECTION(islandsCollection,geoJson,useNearest));
    }
    
    return geoJson;
}

//Return the number of the island closest to any point in an object
//island_features = array of geoJSON feature objects
//object_geojson = geoJSON object (feature or geometry)
function nearestIsland(island_features,obj_geoJson){
    var min = undefined;    //keep track of min dist
    var island;             //keep track of closest island
    
    //find object geometry
    var objGeom = obj_geoJson.geometry || obj_geoJson;
    
    //iterate through each island
    for(var i=0,iLen=island_features.length;i<iLen;i++){
        //find island geometry
        var islandGeom = island_features[i].geometry;
        if(islandGeom.type === "Polygon"){
            if(objGeom.type === "Point"){
                //find minimum distance from the point to the polygon
                var dist = distToPolySquared(coordsToPoly(islandGeom.coordinates),coordsToPoint(objGeom.coordinates));
                //if distance is lower or 1st, override islands and minumum with new values
                if((min===undefined) || dist<min){
                    min=dist;
                    island = island_features[i].properties.Numero;
                }
            }
            else if(objGeom.type === "MultiPoint"){
                objGeom.coordinates.forEach(function(point){
                    var dist = distToPolySquared(coordsToPoly(islandGeom.coordinates),coordsToPoint(point));
                    if((min===undefined) || dist<min){
                        min=dist;
                        island = island_features[i].properties.Numero;
                    }
                });
            }
            else if(objGeom.type === "Polygon"){
                objGeom.coordinates.forEach(function(linearRing){
                    linearRing.forEach(function(point){
                        var dist = distToPolySquared(coordsToPoly(islandGeom.coordinates),coordsToPoint(point));
                        if((min===undefined) || dist<min){
                            min=dist;
                            island = island_features[i].properties.Numero;
                        }
                    });
                });
            }
            else if(objGeom.type === "MultiPolygon"){
                objGeom.coordinates.forEach(function(polygon){
                    polygon.forEach(function(linearRing){
                        linearRing.forEach(function(point){
                            var dist = distToPolySquared(coordsToPoly(islandGeom.coordinates),coordsToPoint(point));
                            if((min===undefined) || dist<min){
                                min=dist;
                                island = island_features[i].properties.Numero;
                            }
                        });
                    });
                });
            }
        }
        else if(islandGeom.type === "MultiPolygon"){
            islandGeom.coordinates.forEach(function(islandPoly){
                if(objGeom.type === "Point"){
                    var dist = distToPolySquared(coordsToPoly(islandPoly),coordsToPoint(objGeom.coordinates));
                    if((min===undefined) || dist<min){
                        min=dist;
                        island = island_features[i].properties.Numero;
                    }
                }
                else if(objGeom.type === "MultiPoint"){
                    objGeom.coordinates.forEach(function(point){
                        var dist = distToPolySquared(coordsToPoly(islandPoly),coordsToPoint(point));
                        if((min===undefined) || dist<min){
                            min=dist;
                            island = island_features[i].properties.Numero;
                        }
                    });
                }
                else if(objGeom.type === "Polygon"){
                    objGeom.coordinates.forEach(function(linearRing){
                        linearRing.forEach(function(point){
                            var dist = distToPolySquared(coordsToPoly(islandPoly),coordsToPoint(point));
                            if((min===undefined) || dist<min){
                                min=dist;
                                island = island_features[i].properties.Numero;
                            }
                        });
                    });
                }
                else if(objGeom.type === "MultiPolygon"){
                    objGeom.coordinates.forEach(function(polygon){
                        polygon.forEach(function(linearRing){
                            linearRing.forEach(function(point){
                                var dist = distToPolySquared(coordsToPoly(islandPoly),coordsToPoint(point));
                                if((min===undefined) || dist<min){
                                    min=dist;
                                    island = island_features[i].properties.Numero;
                                }
                            });
                        });
                    });
                }
            });
        }
    }
    //return island number of the island closest to the object
    return island;
}

//Return the numbers of the islands closest to each point in an object
//island_features = array of geoJSON feature objects
//object_geojson = geoJSON object (feature or geometry)
function nearestIslands(island_features,obj_geoJson){
    var islands = [];   //keep track of island numbers returned by nearestIsland()
    
    //find object geometry
    var objGeom = obj_geoJson.geometry || obj_geoJson;
    if(objGeom.type === "Point"){
        islands.push(nearestIsland(island_features,objGeom));
    }
    else if(objGeom.type === "MultiPoint"){
        objGeom.coordinates.forEach(function(point){
            islands.push(nearestIsland(island_features,{type:"Point",coordinates:point}));
        });
    }
    else if(objGeom.type === "Polygon"){
        objGeom.coordinates.forEach(function(linearRing){
            linearRing.forEach(function(point){
                islands.push(nearestIsland(island_features,{type:"Point",coordinates:point}));
            });
        });
    }
    else if(objGeom.type === "MultiPolygon"){
        objGeom.coordinates.forEach(function(polygon){
            polygon.forEach(function(linearRing){
                linearRing.forEach(function(point){
                    //for each point in this object, push the nearest island to list of islands
                    islands.push(nearestIsland(island_features,{type:"Point",coordinates:point}));
                });
            });
        });
    }
    var seen = {};
    //remove duplicate islands and return the result
    return islands.filter(function(number,index,array){
        return seen[number] ? false : (seen[number]=true);
    });
}

//Return list of all Island ID numbers an object is in/intersects
function queryIslands(island_features,obj_geoJson,useNearest){
    var seen = {};
    //if useNearest option is selected, call useNearest, else perform query and filter
    return useNearest ? nearestIslands(island_features,obj_geoJson) : 
        island_features.filter(function(island){
            //keep islands that intersect
            return queryIsland(island,obj_geoJson);
        }).map(function(island){
            //convert to number
            return island.properties.Numero;
        }).filter(function(number,index,array){
            //remove duplicates
            return seen[number] ? false : (seen[number]=true);
            //return array.indexOf(number) == index;
        });
}

function queryIslands_COLLECTION(islands_collection,obj_geoJson,useNearest){
    var output = new Array(0);
    
    for(property in islands_collection){
        if(islands_collection.hasOwnProperty(property)){
            output.push(islands_collection[property]);
        }
    }
    return queryIslands(output,obj_geoJson,useNearest);
}
function queryIslands_JSON(islands_geoJson,obj_geoJson,useNearest){
    return queryIslands(islands_geoJson.features,obj_geoJson,useNearest);
}
function queryIslands_LAYER(islands_geoLayer,obj_geoJson,useNearest){
    return queryIslands(islands_geoLayer._layers.map(function(layer){
        return layer.feature;
    }),obj_geoJson,useNearest);
}

//Check if a single object is in/overlaps a single island
function queryIsland(island_geoJson,obj_geoJson){
    //find just geometries
    var islandGeom = island_geoJson.geometry || islands_geoJson;
    var objGeom = obj_geoJson.geometry || obj_geoJson;
    
    if(islandGeom.type === "Polygon"){
        if(objGeom.type === "Point"){
            return pointInPoly(coordsToPoint(objGeom.coordinates),coordsToPoly(islandGeom.coordinates));
        }
        else if(objGeom.type === "MultiPoint"){
            return objGeom.coordinates.some(function(point){
                return pointInPoly(coordsToPoint(point),coordsToPoly(islandGeom.coordinates));
            });
        }
        else if(objGeom.type === "Polygon"){
            return polyInterset(coordsToPoly(objGeom.coordinates),coordsToPoly(islandGeom.coordinates));
        }
        else if(objGeom.type === "MultiPolygon"){
            return objGeom.coordinates.some(function(polygon){
                return polyInterset(coordsToPoly(polygon),coordsToPoly(islandGeom.coordinates));
            });
        }
    }
    else if(islandGeom.type === "MultiPolygon"){
        if(objGeom.type === "Point"){
            return islandGeom.coordinates.some(function(islandPoly){
                return pointInPoly(coordsToPoint(objGeom.coordinates),coordsToPoly(islandPoly));
            });
        }
        else if(objGeom.type === "MultiPoint"){
            return islandGeom.coordinates.some(function(islandPoly){
                return objGeom.coordinates.some(function(point){
                    return pointInPoly(coordsToPoint(point),coordsToPoly(islandPoly));
                });
            });
        }
        else if(objGeom.type === "Polygon"){
            return islandGeom.coordinates.some(function(islandPoly){
                return polyInterset(coordsToPoly(objGeom.coordinates),coordsToPoly(islandPoly));
            });
        }
        else if(objGeom.type === "MultiPolygon"){
            return islandGeom.coordinates.some(function(islandPoly){
                return objGeom.coordinates.some(function(polygon){
                    return polyInterset(coordsToPoly(polygon),coordsToPoly(islandPoly));
                });
            });
        }
    }
    return false;
}
    
//************************
//Object Query Functions
//************************

//Search the objects properties for information pertaining to islands
function findIslands(obj){
    var output = new Array(0);
    
    if(!obj){
        return output;
    }
    
    //iterate through each property in the object
    for(property in obj){
        if(Object.prototype.hasOwnProperty.call(obj, property)){
            //if property has island information, extract it
            if(property.toString() == "Numero" ||
               stringContains((property.toString()).toUpperCase(),"ISLAND")||
               stringContains((property.toString()).toUpperCase(),"ISOLA")){
                //if value is an array, add each element seperately
                if (obj[property].constructor === Array){
                    for(var i=0;i<obj[property].length;i++){
                        //Only keep integers and no repeats
                        if(isInt(obj[property])&&(output.indexOf(obj[property])<0)){
                            output.push(obj[property][i]);
                        }
                    }
                }
                //only keep integers and no repeats
                else if(isInt(obj[property])&&(output.indexOf(obj[property])<0)){
                    output.push(obj[property]);
                }
            }
            //if property is an object, use recursion to search this object as well
            else if(typeof obj[property] === 'object'){
                var array = findIslands(obj[property]);
                output = mergeArrays(output,array);
            }
        }
    }
    return output;
}

//search the object's properties for valid Latitude and Longitude coordinates
function findLonLat(obj){
    var lon = null,lat = null;
    
    if(!obj){
        return [lon,lat];
    }
    
    //iterate through all properties in object
    for(property in obj){
        if(Object.prototype.hasOwnProperty.call(obj, property)){
            //if property is an object, search recursively
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
                else if(stringContains((property.toString()).toUpperCase(),"LONGTITUDE") || 
                        stringContains((property.toString()).toUpperCase(),"LONGITUDE")){
                    lon = obj[property];
                }
            }
        }
    }
//    if(lon && lat && parseFloat(lon) && parseFloat(lat))
//        return [parseFloat(lon),parseFloat(lat)];
    return[lon,lat];
}

//************************
//Helper Functions
//************************

//converty array to {x,y}
function coordsToPoint(coordinates){
    if(coordinates.x && coordinates. y){
        return coordinates;
    }
    return {
        x: coordinates[0],
        y: coordinates[1]
    }
}

//convert array of arrays to [{x,y},{x,y}]
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

//check if something is integer
function isInt(value) {
  var x;
  if (isNaN(value)) {
    return false;
  }
  x = parseFloat(value);
  return (x | 0) === x;
}

//combine 2 arrays without repeating;
function mergeArrays(a1,a2){
    return a1.concat(a2.filter(function(item){
        return a1.indexOf(item)<0;
    }));
}

//check if string is in another string (case sensitive)
function stringContains(outerString,innerString){
    return outerString.indexOf(innerString) > -1;
}

//************************
//Test for valis geoJSON
//************************
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