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

// function for generating the colors for Island_style
//function getColor(d) {
//    if(opaqueFlag){
//        return 'rgba(0,0,0,0)';
//    } else{
//    
//    if(d!=undefined){
//        return d > 3000 ? '#4d004b' :
//           d > 2000 ? '#810f7c' :
//           d > 1000 ? '#88419d' :
//           d > 500  ? '#8c6bb1' :
//           d > 200  ? '#8c96c6' :
//           d > 100  ? '#9ebcda' :
//           d > 50   ? '#bfd3e6' :
//           d > 20   ? '#e0ecf4' :
//           d > 10   ? '#f7fcfd' :
//                      '#f7fcfd';
//    }
//    return 'rgba(255, 0, 0, 0.64)';
//    }
//}

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
    
//    islands_multi.eachLayer(function(layer) {
//        // Your function that determines a fill color for a particular
//        // property name and value.
//        //var myFillColor = generateRandomColors();
//        var myFillColor = colorControl.getColor(layer.feature.properties);
//
//        layer.setStyle({
//                fillColor: myFillColor,
//                weight: 0,
//                opacity: 1,
//                color: 'black',
//                dashArray: '1',
//                fillOpacity: 0.7
//        });
//    });
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

function Filter_style(feature){
    return{
        padding: "2px 6px 0px"
    }
}

function FilterElement_style(feature){
    return{
        margin: "4px",
        verticalAlign: "top"
    }
}

function Color_style(feature){
    return{
       padding: "2px 6px 0px"
    }
}

function ColorElement_style(feature){
    return{
        margin: "4px",
        verticalAlign: "top"
    }
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
