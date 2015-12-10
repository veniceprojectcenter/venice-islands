// ~~~~~~~~ Functions for Retrievings Data ~~~~~~~~~~~~~~~~~~~~~

//Add a data set to be displayed on the map!
//groupOptions = { tag: string, filter: boolean function(obj),moreInfo: string(HTML) function(feature)};
//customArgs = SEE http://leafletjs.com/reference.html#geojson-options
function getGroup(URL,groupOptions,customArgs){
    //$.getJSON(URL,partial(getGroupCallback,tag,customArgs,URL));
    $.getJSON(URL,function(msg){
        if(!msg) return;
        getGroupCallback(groupOptions,customArgs,URL,msg);});
}

function setIslandOptions(islandOptions){
    if(islandOptions){
        if(islandOptions.searchInclude){
            searchControl.includeKeys(islandOptions.searchInclude);
        }
        if(islandOptions.searchExclude){
            searchControl.excludeKeys(islandOptions.searchExclude);
        }
    }
    islands_layer.islandOptions = islandOptions;
}
function addIslands(geoJSON){
    var layer;
    if(geoJSON.type == "FeatureCollection"){
        layer = geoJSON;
    }
    else if(geoJSON.type == "Feature"){
        layer = {type:"FeatureCollection",features:[geoJSON]};
    }
    else{
        try{
            addIslands(CKtoGeoJSON(geoJSON));
        }
        catch(e){
            console.error("Invalid island format: requires geoJSON Feature or featureCollection");
        }
        return;
    }
    
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

    var params = getUrlParameters();

    if(!params.layerTag || params.layerTag == 'islands'){
        for(key in params){
            if(params.hasOwnProperty(key)&&key!='layerTag'){
                var layer = findIslandLayer(key,params[key]);
                if(layer){
                    map.fitBounds(layer.getBounds());
                    return;
                }
            }
        }
    }

    searchControl.refresh();
    recolorIsles();
}
//Add an Island Base Layer to the map!
//options = { searchInclude: string[], searchExclude: string[]};
function getIslands(path,islandOptions){
    $.ajax({
        dataType: "json",
        url: path,
        success: function(msg){
            if(!msg) return;
            addIslands(msg);
        },
        complete: function(){
            loadingScreen.remove();
            if(loadingScreen.queue==0)  onAllIslandsLoaded();
        },
        beforeSend: function(){
            loadingScreen.add();
            if(islandOptions) setIslandOptions(islandOptions);
        }
    });

//    $.getJSON(path,function(msg){
//        var layer = msg;
//
//        for(var i=0,iLen=layer.features.length;i<iLen;i++){
//            var feature = layer.features[i];
//            feature.visible = true;
//            islandsCollection[feature.properties.Numero] = feature;
//        }
//        islands_layer.addData(layer);
//        if(!filter.object){
//            filter.setObject(layer.features[0].properties);
//            filter.minimize(filter.minimized);
//        }
//        if(!colorControl.object){
//            colorControl.setObject(layer.features[0].properties);
//            colorControl.minimize(filter.minimized);
//        }
//        
//        if(islandOptions) setIslandOptions(islandOptions);
//        
//        var params = getUrlParameters();
//        
//        if(!params.layerTag || params.layerTag == 'islands'){
//            for(key in params){
//                if(params.hasOwnProperty(key)&&key!='layerTag'){
//                    var layer = findIslandLayer(key,params[key]);
//                    if(layer){
//                        map.fitBounds(layer.getBounds());
//                        return;
//                    }
//                }
//            }
//        }
//        
//        searchControl.refresh();
//        recolorIsles();
//        
//        islandQueue--;
//        if(islandQueue==0){
//            onAllIslandsLoaded();
//        }
//    });
}
function getIslandsGroup(path,islandOptions){
    $.ajax({
        dataType: "json",
        url: path,
        success: function(msg){
            if(!msg) return;
            for(property in msg.members){
                if(msg.members.hasOwnProperty(property)){
                    var newURL = "https://"+ path.split("/")[2]+"/data/" + msg.members[property] + ".json";
                    $.ajax({
                        dataType: "json",
                        url: newURL,
                        success: function(msg2){
                            var island = CKtoGeoJSON(msg2);
                            island.properties=island.properties.data;
                            addIslands(island);
                        },
                        complete: function(){
                            loadingScreen.remove();
                            if(loadingScreen.queue==0)  onAllIslandsLoaded();
                        },
                        beforeSend: function(){
                            loadingScreen.add();
                        }
                    });
                }
            }
        },
        complete: function(){
            console.log('recieve1');
        },
        beforeSend: function(){
            if(islandOptions) setIslandOptions(islandOptions);
            console.log("send1");
        }
    });
}

//***********************************************************************************************

//------- Island Layers --------//
getIslands('IslesLagoon_single.geojson');
getIslands('IslesLagoon_multi.geojson');

//getIslandsGroup("https://cityknowledge.firebaseio.com/groups/MAPS_Islands_2015.json");

setIslandOptions({searchInclude: ['Nome_Isola','Numero','Codice'],generalInfo: function(target){
    return printObject(target,function(str){
            switch(str){
                case 'Nome_Isola':
                case 'Numero':
                    return true;
                default:
                    return false;
            }
    });
},moreInfo: function(targets){
    var output ='';
    if(targets.length==1){
        output+='<b><center>Base Layer Data</center></b>';
        output += printObject(targets[0]);
    }
    else if(targets.length>1){
        output += '<center><b>Islands</b> ('+targets.length+' Total)</center>';
        targets.forEach(function(target){
            output += target.Nome_Isola + '</br>';
            
        });
    }
    return output;
}});

//***********************************************************************************************

function onAllIslandsLoaded(){
    

    //------- Bridge Layers --------//
    getGroup("https://cityknowledge.firebaseio.com/groups/MAPS%20Bridges.json",{tag: "Bridges",generalInfo: function(target){
        return printObject(target.data,function(str){
            switch(str){
                case 'Nome_Ponte':
                case 'Superficie':
                    return true;
                default:
                    return false;
            }
        });
    },moreInfo:function(targets,tag){
        var output = '';
        targets.forEach(function(target){
            output += '<a target="_blank" href=http://www.venipedia.org/wiki/index.php?title='+ encodeURIComponent(target.data.Nome_Ponte.replace(/ /g, "_")) + '>' + target.data.Nome_Ponte+'</a></br>';
        });
        output = '<center><b>'+ dictionary(tag) +'</b> ('+targets.length+' Total)</br></center>' + output;
        return output;
    }},{style: standOut});


    //------- Canal Layers --------//
    getGroup("https://cityknowledge.firebaseio.com/groups/MAPS%20Canals.json",{tag: "Canals",generalInfo: function(target){
        return printObject(target.data,function(str){
            switch(str){
                case 'Nome_Rio':
                case 'Superficie':
                    return true;
                default:
                    return false;
            }
        });
    },moreInfo:function(targets,tag){
        var output = '';
        targets.forEach(function(target){
            output += '<a target="_blank" href=http://www.venipedia.org/wiki/index.php?title='+ encodeURIComponent(target.data.Nome_Rio.replace(/ /g, "_")) + '>' + target.data.Nome_Rio+'</a></br>';
        });
        output = '<center><b>'+ dictionary(tag) +'</b> ('+targets.length+' Total)</br></center>' + output;
        return output;
    }},{onEachFeature:function(feature,layer){
        layer.bindPopup(
            '<b><center>' + feature.properties.data.Nome_Rio + '</center></b>'
        );
    }});

    //------- Belltower Layers --------//
//getGroup("https://cityknowledge.firebaseio.com/groups/belltowers%20MAPS%2015.json",{tag:"Bell Towers",generalInfo: function(target){
//    return printObject(target.data,function(str){
//            switch(str){
//                    case 'NAME':
//                     return true;
//                default:
//                    return false;
//            }
//    });
//    },moreInfo:function(targets,tag){
//        var output = '';
//        targets.forEach(function(target){
//            output += target.data.NAME+'</br>'
//            });
//        output = '<center><b>'+ dictionary(tag) +'</b> ('+targets.length+' Total)</br></center>' + output;
//        return output;
//    }},{pointToLayer: function(feature,latlng){
//        return new L.marker(latlng, {icon: churchIcon}).bindPopup(
//        "<b>" + feature.properties.data.NAME + "</b></br>" +
//        "Code: " + feature.properties.data.CODE + "</br>" +
//        "Date Recorded: " + feature.properties.birth_certificate.dor + "</br>"
//        );
//    }});
    
getGroup("https://cityknowledge.firebaseio.com/groups/Bell%20Tower%20Page%20Final.json",{tag:"Bell Towers",useNearest:true,generalInfo: function(target){
        return printObject(target.data,function(str){
            switch(str){
                case 'Page name':
                    return true;
                default:
                    return false;
            }
        });
    },moreInfo:function(targets,tag){
        var output = '';
        targets.forEach(function(target){
            output+= '<a target="_blank" href=http://www.venipedia.org/wiki/index.php?title='+ encodeURIComponent(target.data["Page name"].replace(/ /g, "_")) + '>' + target.data["Page name"]+'</a></br>' +
                (target.data["Decoration description"]!="Null" ? "Decorations: " + target.data["Decoration description"] + '</br>':'');
        });
        output = '<center><b>'+ dictionary(tag) +'</b> ('+targets.length+' Total)</br></center>' + output;
        return output;
    }},{pointToLayer: function(feature,latlng){
        return new L.marker(latlng, {icon: churchIcon}).bindPopup(
        "<b>" + feature.properties.data["Common name"] + "</b></br>" +
        "Tower ID: " + feature.properties.data["Bell Tower ID"] + "</br>" +
        "Tower Height: " + feature.properties.data["Bell Tower ID"] + "</br>"
        );
    }});


    //------- Hotel Layers --------//
    getGroup("https://cityknowledge.firebaseio.com/groups/maps_HOTELS08_PT_15.json",{tag: "HotelsMap",generalInfo: function(target){
        return printObject(target.data,function(str){
            switch(str){
                case 'name':
                case 'beds':
                    return true;
                default:
                    return false;
            }
        });
    },moreInfo:function(targets,tag){
        var output = '';
        var bedCount = 0;
        targets.forEach(function(target){
            bedCount += target.data.beds;
        });
        output = '<center><b>'+ dictionary(tag) +'</b> ('+targets.length+' Total)</br></center>' + output;
        output += '<b> Total Beds: </b>'+bedCount+'</br>';
        return output;
    }},{style: hotelStyle,pointToLayer: function(feature,latlng){
        return new L.marker(latlng, {icon: hotelIcon}).bindPopup("I am a hotel");
    }});

    

//------- Wiki Data Islands --------//
getGroup("https://cityknowledge.firebaseio.com/groups/MERGE_Islands_2015.json",{tag:"Wiki Data",preLoad: true,toggle:false,moreInfo: function(targets,tag){
    var output = '';
    targets.forEach(function(target){
        if(target.media) var imageHash = Object.keys(target.media.images)[0];
        output+=
            (target.media ? '<img src="'+target.media.images[imageHash].small+'" id="embeddedImage">':'') +
            (target.data.Blurb?'<b>About: </b>'+ target.data.Blurb+'</br>':'') +
        '<a href="'+ target.data.Bibliography +'" id="bib" target="_blank" class="button">View Bibliography</a></br>' +
        '</br><table border="1" style="width:100%">'+
        '<tr>'+
            '<td>'+ 'Handicap Accessible' + '</td>' +
            '<td>'+ target.data.Handicap_Accessibility + '</td>' +
        '</tr>' + '<tr>'+
            '<td>'+ 'Island Group' + '</td>' +
            '<td>'+ target.data.Sestiere + '</td>' +
        '</tr>' + '<tr>'+
            '<td>'+ 'Usage' + '</td>' +
            '<td>'+ target.data.Usage + '</td>' +
        '</tr>' + 
            (target.data.Boat_Stop ? '</tr>' + '<tr>'+
            '<td>'+ 'Boat Stop(s)' + '</td>' +
            '<td>'+ target.data.Boat_Stop + ': Line(s) ' + target.data.Boat_Line + '</td>' +
        '</tr>'  :'' ) +
        '</table>'
    });
    output = '<center><b>'+ dictionary(tag) +'</b></br></center>' + output;
    return output;
}},{pointToLayer: function(feature,latlng){
    return new L.marker(latlng, {icon: noIcon});
}});

    //------- Sewer Outlet Layers --------//
    getGroup("https://cityknowledge.firebaseio.com/groups/maps_HOLES_PT_15.json",{tag: "Sewer Outlets",generalInfo: function(target){
        return printObject(target.data,function(str){
            switch(str){
                case 'HOLE_NUM':
                case 'AREA':
                    return true;
                default:
                    return false;
            }
        });
    },moreInfo:function(targets,tag){
        var output = '';
        targets.forEach(function(target){

        });
        output = '<center><b>'+ dictionary(tag) +'</b> ('+targets.length+' Total)</br></center>' + output;
        return output;
    }},{pointToLayer: function(feature,latlng){
        return new L.marker(latlng, {icon: sewerIcon}).bindPopup("outlet");
    }});

    //------- Convent Layers --------//
    getGroup("https://cityknowledge.firebaseio.com/groups/Convents%20Data.json",{generalInfo: function(target){
        return printObject(target.data,function(str){
            switch(str){
                case 'Full Name':
                case 'Current Use':
                    return true;
                default:
                    return false;
            }
        });
    },moreInfo:function(targets,tag){
        var output = '';
        var first = true;
        targets.forEach(function(target){
            if(!first){
                output+='</br>';
            }
            first=false;
            output += 'Name: ' + target.data["Full Name"] + '</br>' +
                'About: ' + target.data["Historic Background"] + '</br>' +
                'Current Use: ' + target.data["Current Use"] + '</br>' +
                'Founded in ' + target.data["Year Founded"] + '</br>';
        });
        output = '<center><b>'+ dictionary(tag) +'</b> ('+targets.length+' Total)</br></center>' + output;
        return output;
    }},{pointToLayer: function(feature,latlng){
        return new L.marker(latlng, {icon: conventIcon}).bindPopup("I am a convent");
    }});


    //------- Store Layers --------//
    getGroup("https://ckdata.firebaseio.com/groups/MERGE%20Stores%202012.json",{tag:'Stores',filter:function(obj){
        if(obj["2015"]) return true;
    },moreInfo: function(targets,tag){
    // **************************************
    // !!!!!!!! THIS IS A TEST ONLY !!!!!!!! - I'm going to be modifying it 
    // further as I explore making a table-generation function, setting up titles, and overall styling
    // **************************************
        var output = '';
        output ='<table border="1" style="width:100%">' +
                        '<tr>' +
                            '<th>Name</th>' +
                            '<th>Address</th>' +
                            '<th>Good Sold</th>' +
                        '</tr>';
        targets.forEach(function(target){
            output +=
            '<tr>'+
                '<td>'+ (target["2015"].name ? target["2015"].name : 'N/A') + '</td>' +
                '<td>'+ target["2015"].address_number 
                     +' '+ target['2015'].address_street + '</td>' +
                '<td>'+ (target["2015"].nace_plus_descr=='undefined' ? 'N/A': target["2015"].nace_plus_descr) + '</td>' +
            '</tr>' ;        

    //                'Name: ' + (target["2015"].name ? target["2015"].name : 'N/A') + '</br>' +
    //                 'Location: ' + target["2015"].address_number 
    //                 +' '+ target['2015'].address_street + 
    //                 '</br>Good sold: ' + (target["2015"].nace_plus_descr ? target["2015"].nace_plus_descr : 'N/A')
    //                + '</br>'+'</br>';
        });
        output = '<center><b>'+ dictionary(tag) +'</b> ('+targets.length+' Total)</br></center>' + output;
        return output;
    }},{pointToLayer: function(feature,latlng){
        return new L.marker(latlng, {icon: storeIcon}).bindPopup(
        //"<img style=\"width:100%\" src=\"" + feature.properties['2015'].picture_url + "\"/><br/>" + 
            "<b>" + feature.properties['2015'].name + "</b>" +
            "<br/> Address: " + feature.properties['2015'].address_number + 
            " " + feature.properties['2015'].address_street +  
            "<br/> Nace+ Code: " + feature.properties['2015'].nace_plus_code +
            "<br/> Good Sold: " + feature.properties['2015'].nace_plus_descr +
            "<br/> Store Type: " + feature.properties['2015'].shop_type
        );
    }});

    
}