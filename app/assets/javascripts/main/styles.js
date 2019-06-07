//******* Necessary - Used by core application to style layers. Must exist but can be modified ********//
var opaqueFlag = false;

function Island_style(feature) {
   // console.log(feature.properties);
    return {
        fillColor: colorControl.getColor(feature.properties),
        weight: 0,
        opacity: 1,
        color: 'black',
        dashArray: '1',
        fillOpacity: 0.7
    };
}

// function for changing the feature instances within a layer
// pass in a property name as a string
// islands_single.setStyle(a_style) also works for changing style 
function recolorIsles() {
    
    islands_layer.eachLayer(function(layer) {
        // Your function that determines a fill color for a particular
        // property name and value.
        //var myFillColor = generateRandomColors();
        if(!layer.feature){
            console.log(layer);
        }
        var myFillColor = colorControl.getColor(layer.feature.properties);
        //console.log(layer.feature.properties);
        layer.setStyle({
                fillColor: myFillColor,
                weight: 0,
                opacity: 1,
                color: 'black',
                dashArray: '1',
                fillOpacity: 0.7
        });
    });
}

//*********************************************************************************
function Random_style(feature) {
    return {
        fillColor: generateRandomColors(),
        weight: 0,
        opacity: 1,
        color: 'black',
        dashArray: '1',
        fillOpacity: 0.7
    };
}

function Highlight_style(feature) {
    return {
        fillColor: '#7fcdbb',
        weight: 2,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.3
    };
}

// this section contains an alternate styling for polygons
function hotelStyle(feature) {
    return {
        fillColor: '#f04cfe',
        weight: 1.5,
        opacity: 1,
        color: '#000000',
        dashArray: '3',
        fillOpacity: 1.0
    };
}

function standOut(feature) {
    return {
        fillColor: '#FEB24C',
        weight: 1.5,
        opacity: 1,
        color: '#ff0000',
        dashArray: '3',
        fillOpacity: 1.0
    };
}
