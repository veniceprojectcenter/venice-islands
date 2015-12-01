// overlays modal-esque information box on top of the page to show all available info

// https://raventools.com/blog/create-a-modal-dialog-using-css-and-javascript/

function overlayOn(currentLayer){
    if(!overlayFlag){
        overlay(currentLayer);
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

// this function is called from the zoomToFeature() function
function overlay(currentLayer) {
	el = document.getElementById("overlay");
	el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
    
    // toggle the state of the function flag, this affects hilighting 
    overlayFlag ^= true;

//    currentLayer.setStyle({
//        fillColor: '#FEB24C',
//        weight: 0,
//        opacity: 1,
//        color: 'white',
//        dashArray: '3',
//        fillOpacity: 1.0
//    });
    
    // if the info box is being turned off don't do any additional work
    if(!currentLayer){return;}
    
    // make life a little easier
    var properties = currentLayer.feature.properties;
    // print out whatever info you want to the 'inner' div of the 'overlay' div of index.html
    
    // currently have an issue with the scroll bar appearing on the outer div containing the map
    // instead of the info window
    document.getElementById("inner").innerHTML= '<a onclick = "overlay()" class = "Xbutton">X</a> <b><center>Island Information</center></b>'
        +' <br />';
//        + (properties ?
//        '<b>' + 'Name: ' + properties.Nome_Isola + '</b><br />' 
//        + 'Codice: ' + properties.Codice + '</b><br />'
//        + 'Island Number: ' + properties.Insula_Num + '</b><br />'
//        + '2011 Census Tract Number: ' + properties.Numero + '</b><br />'
//        + 'Total Population: ' + properties.sum_pop_11 + '</b><br />' 
//        + '<b><br />Overlays: </b>' + layerController._layers
//        :''); 
//   
    makeHTMLinfo(properties,"inner","JSON");
   
    addOverlayInfo("inner",properties.Numero);
    
    
    // Add in the venipedia and cartography buttons
    $(document.getElementById("inner")).append('<br /> <br /><a href="" id="venipedia"  target="_blank" onMouseOver="return changeImage()" onMouseOut= "return changeImageBack()"> <img name="jsbutton" src="image/venipedia.png" width="80" height="70" border="0" alt="javascript button" align="left"></a>'  
         + '<a href="http://cartography.veniceprojectcenter.org/" target="_blank" class="button">View on a historical map</a>');
    
    // generate correct venipedia link for associated island
    var link = "http://www.venipedia.org/wiki/index.php?title=Island_of_" + encodeURIComponent(properties.Nome_Isola.replace(/ /g, "_")); 
    document.getElementById("venipedia").href = link;
    
    // function for getting rid of overlay when you click on the screen
    // update later to remove only when clicking outside of 'overlay' div
    $(document).ready(function() {
        $('#overlay').on('dblclick', function(e) { 
            overlayOff(currentLayer);
        });
    });
    
    var myimgobj = document.images["jsbutton"];
    
};

//supporting functions for venipedia button
//http://www.javascript-coder.com/button/javascript-button-p1.phtml
function changeImage()
{
    document.images["jsbutton"].src= "image/venipedia2.png";
    return true;
}

function changeImageBack()
{
    document.images["jsbutton"].src = "image/venipedia.png";
    return true;
}

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

function printObject(props,depth)
{
    depth = depth || 0;
    var output = '';

    if(!props){
        return  props + '<br />';
    }
    
    if(props.constructor === Array){
        output += "["
        if(props.length>0){
            output+=props[0];
            for(var i = 1;i<props.length;i++){
                output += ', '+props[i];
            }
        }
        output += ']<br />';
    }
    else if(typeof props === 'object'){
        //output+= tabs(depth) + '<b>'+property + '</b>: ';
        for(property in props){
            output += tabs(depth) + '<b>' + dictionary(property) + ':</b> '+printObject(props[property],depth+1);
        }
    }
    else{
        output += props + '<br />';
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

    // figure out what overlays are turned on/being used
    layers = Object.keys(featureCollections);
    for(var k =0; k<layers.length; k++){
        // if the layer has objects, keep goung 
        if (!$.isEmptyObject(featureCollections[layers[k]]._layers)){
            //console.log(layers[k]);
            
            
            // pull out what's tagged by isle
            var target = $.map(featureCollections[layers[k]]._layers, function(e){return e.feature.properties});
            var arrayLength = target.length;
            var tempData = [];
            var first = true; // flag for displaying layers[k] (category title)
            for (var i = 0; i < arrayLength; i++) {  
                if($.inArray(num,target[i].islands)!=-1) {
                    if(first) {
                        $(document.getElementById(id)).append('<br><b><center>'+ layers[k]+'</center></b></br>');
                        first = false;
                    }
                    tempData.push(target[i]);
                    // bridges
                    if(target[i].data.Nome_Ponte){
                        //console.log(target[i].data.Nome_Ponte);
                        $(document.getElementById(id)).append(target[i].data.Nome_Ponte+'</br>');
                    }
                    // bell towers
                    else if(target[i].data.NAME){
                        //console.log(target[i].data.NAME);
                        $(document.getElementById(id)).append(target[i].data.NAME+'</br>');
                    }
                    // island churches
                    else if(target[i].data["Full Name"]){
                        //console.log(target[i].data["Full Name"]);
                        $(document.getElementById(id)).append(target[i].data["Full Name"]+'</br>');
                    }
                    // canals
                    else if(target[i].data.Nome_Rio){
                        $(document.getElementById(id)).append(target[i].data.Nome_Rio+'</br>');
                    }
                    else if(layers[k]=="Wiki Data"){
                        $(document.getElementById(id)).append(
                            '<b>About: </b>'+ target[i].data.Blurb+'</br>' +
                            '<a href="" id="bib" target="_blank" class="button">View Bibliography</a></br>' +
                            '<table border="1" style="width:100%">'+
                            '<tr>'+
                                '<td>'+ 'Handicap Accessible' + '</td>' +
                                '<td>'+ target[i].data.Handicap_Accessibility + '</td>' +
                            '</tr>' + '<tr>'+
                                '<td>'+ 'Inhabited?' + '</td>' +
                                '<td>'+ target[i].data.Inhabited + '</td>' +
                            '</tr>' + '<tr>'+
                                '<td>'+ 'Type' + '</td>' +
                                '<td>'+ target[i].data.Type + '</td>' +
                            '</tr>' + '<tr>'+
                                '<td>'+ 'Usage' + '</td>' +
                                '<td>'+ target[i].data.Usage + '</td>' +
                            '</tr>' +
                            '</table>'
                        );
                        // add the correct link to the button
                        document.getElementById("bib").href = target[i].data.Bibliography;
                    }
                    // still need to add name support for the following OR just look for a field
                    // that either has "Name" or "Nome" as part of it
                    // shops
                    // hotels
                    // sewer outlets
                }
            }
        }
    }
}