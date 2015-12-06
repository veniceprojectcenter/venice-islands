// overlays modal-esque information box on top of the page to show all available info

// https://raventools.com/blog/create-a-modal-dialog-using-css-and-javascript/

function overlayOn(currentLayer){
    if(!overlayFlag){
        if(currentLayer._layers){
            overlayMulti(currentLayer);
        }
        else{
            overlay(currentLayer);
        }
    }
}
function overlayOff(currentLayer){
    if(overlayFlag){
        overlay(currentLayer);
    }
}

//TODO: make this function more flexible:
//  -to be customized in the getData() file (appearence, content, etc)
//  -be prettier?
//  -check boxesfor what appears in general info?
//  -to work with any layer (not just islands)?
//  -translate fields

function overlayHTML(HEAD,BODY) {
	el = document.getElementById("overlay");
	el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
    
    // toggle the state of the function flag, this affects hilighting 
    overlayFlag ^= true;

    // if the info box is being turned off don't do any additional work
    if(!overlayFlag){return;}

    document.getElementById('inner').innerHTML = '<div id ="topBar">'+'<a class = "Xbutton" id = "Xbutton" onclick = "overlay()">X</a>'+
        '<h2><center>' + (HEAD ? HEAD : '') + '</center></h2></div>'
        +' <br />' + (BODY ? BODY : '');
    
    // function for getting rid of overlay when you click on the screen
    // update later to remove only when clicking outside of 'overlay' div
    $(document).ready(function() {
        $('#overlay').on('dblclick', function(e) { 
            overlayOff(islandLayer);
        });
    });
};

function overlayMulti(islandLayer) {
	el = document.getElementById("overlay");
	el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
    
    // toggle the state of the function flag, this affects hilighting 
    overlayFlag ^= true;

    // if the info box is being turned off don't do any additional work
    if(!overlayFlag){return;}

    document.getElementById('inner').innerHTML=
        '<div id ="topBar">'+'<a class = "Xbutton" id = "Xbutton" onclick = "overlay()">X</a>'+
        '<h2><center>' + ('Island Information') + '</center></h2></div>'
        +' <br />';
    
    var nums = [];
    
    islandLayer.eachLayer(function(layer){
        nums.push(layer.feature.properties.Numero);
    });
    
    // add in info on all overlays with information shown on selected isle
    addOverlayInfo("inner",nums);
    
    // function for getting rid of overlay when you click on the screen
    // update later to remove only when clicking outside of 'overlay' div
    $(document).ready(function() {
        $('#overlay').on('dblclick', function(e) { 
            overlayOff(islandLayer);
        });
    });
};

// this function is called from the zoomToFeature() function
function overlay(currentLayer) {
	el = document.getElementById("overlay");
	el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
    
    // toggle the state of the function flag, this affects hilighting 
    overlayFlag ^= true;

    // if the info box is being turned off don't do any additional work
    if(!overlayFlag){return;}
    
    // make life a little easier
    var properties = currentLayer.feature.properties;

    document.getElementById('inner').innerHTML=
        '<div id ="topBar">'+'<a class = "Xbutton" id = "Xbutton" onclick = "overlay()">X</a>'+
        '<h2><center>' + (properties.Nome_Isola ? properties.Nome_Isola : 'Island Information') + '</center></h2></div>'
        +' <br />';
    
    // add in info on the base geoJSON layers
    makeHTMLinfo(properties,"inner","JSON");
   
    // add in info on all overlays with information shown on selected isle
    addOverlayInfo("inner",properties.Numero);
    
    // add in the bottom bar
    $(document.getElementById("inner")).append('<div id="inner2" class="bottomBar">');
    // populate it with the venipedia and cartography links
    $(document.getElementById("inner2")).append('<a href="" id="venipedia"  target="_blank">'+ '<div id="venipediaImage"></div></a>' + '<a href="" id="cartography" target="_blank">'+ '<div id="cartographyImage"></div></a>');
    
    // generate correct venipedia link for associated island
    var link = "http://www.venipedia.org/wiki/index.php?title=Island_of_" + encodeURIComponent(properties.Nome_Isola.replace(/ /g, "_")); 
    document.getElementById("venipedia").href = link;
    
    // now generate the cartography app link
    link = 'http://cartography.veniceprojectcenter.org/index.html?map=debarbari&layer=island&feature=' +
        encodeURIComponent('Island of '+properties.Nome_Isola);
    document.getElementById("cartography").href = link;
    
    // function for getting rid of overlay when you click on the screen
    // update later to remove only when clicking outside of 'overlay' div
    $(document).ready(function() {
        $('#overlay').on('dblclick', function(e) { 
            overlayOff(currentLayer);
        });
    });
};

function makeHTMLinfo(props,id,type)
{
    switch(type){
        case("JSON"): // for geoJSONS that we've made from GIS Layers (info stored in properties)
            $(document.getElementById(id)).append(printObject(props));
            break;
        case("OVERLAY"): // for any layers that are auto-created from venipedia (info stored in properties.data)
            $(document.getElementById(id)).append(printObject(props.data));
            break; 
        default:
            $(document.getElementById(id)).append('Error - Must Specify Type <br />');
            break;
    }
}

function printObject(obj,filter,path)
{
    path = path || [];
    var output = '';

    if(!obj){
        if(!filter || path.some(filter)){
            output +=  obj + '<br />';
        }
        return output;
    }
    
    if(obj.constructor === Array){
        output += "["
        if(obj.length>0){
            output+=obj[0];
            for(var i = 1;i<obj.length;i++){
                output += ', '+obj[i];
            }
        }
        output += ']<br />';
    }
    else if(typeof obj === 'object'){
        for(var property in obj){
            var result = printObject(obj[property],filter,path.concat([property]));
            if(!filter || filter (property) || typeof obj[property] == 'object' || path.some(filter)){
                if(result != '') {
                    output += tabs(path.length) + '<b>' + dictionary(property) + ':</b> '+result;
                }
            }
        }
        if(path.length>0 && output != ''){
            output = '<br />' + output;
        }
    }
    else{
        output += obj + '<br />';
    }
    return output;
}

function tabs(int_num){
    if((!int_num)||int_num===0){
        return '';
    }
    
    var output = '';
    for(var i=0;i<int_num;i++){
        output += '&emsp;';
    }
    return output;
}

/* !!!!!!!! photograph stuff !!!!!!!!
* if we use http://instafeedjs.com/ all we need to do is sign up for an API key from 
* instagram and then showing a feed of pictures tagged by location/hashtag is super easy,
* so that could be an easy way to add photos later on if we want to use it
*/

function addOverlayInfo(id,num){
    if(!(num.constructor === Array)){
        num=[num];
    }
    
    var outer = document.getElementById(id);
    // append a new div element to the more info window
    var info = getOverlayInfo(num);
    if(info!=''){
        $(outer).append(info);
    }   
}

function getOverlayInfo(num){
    var output = '';
    for(key in featureCollections){
        if(featureCollections[key].groupOptions && featureCollections[key].groupOptions.moreInfo){
            var targets = $.map(featureCollections[key]._layers, function(e){return e.feature.properties}).filter(function(target){
                return target.islands.some(function(obj1){
                    return num.some(function(obj2){
                        return obj2 == obj1;
                    });
                });
            });
            if(targets.length>0){
                output += $('<div>').append($('<div>')
                    //specify the class of the div
                    .addClass("moreInfo")
                    //tag that div by the key
                    .attr("id", key.replace(/ /g, "_"))
                    // fill in moreInfo stuff into the new div
                    .append(featureCollections[key].groupOptions.moreInfo(targets,key)).clone()).html();
            }
        }
    }
    return output;
}

