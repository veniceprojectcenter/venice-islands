$.getJSON('IslesLagoon_single.geojson',function(msg){
    var singleLayer = msg;
    
    for(var i=0,iLen=singleLayer.features.length;i<iLen;i++){
        var feature = singleLayer.features[i];
        feature.visible = true;
        islandsCollection[feature.properties.Numero] = feature;
    }
    islands_layer.addData(singleLayer);
    if(!filter.object){
        filter.setObject(singleLayer.features[0].properties);
        filter.minimize(filter.minimized);
    }
    if(!colorControl.object){
        colorControl.setObject(singleLayer.features[0].properties);
        colorControl.minimize(filter.minimized);
    }
    recolorIsles();
});

//$.ajax({
//    dataType: "json",
//    url: 'IslesLagoon_single.geojson',
//    success: function (file_html) {
//        var singleLayer = msg;
//    
//        for(var i=0,iLen=singleLayer.features.length;i<iLen;i++){
//            var feature = singleLayer.features[i];
//            feature.visible = true;
//            islandsCollection[feature.properties.Numero] = feature;
//        }
//        islands_layer.addData(singleLayer);
//    },
//    async: false
//});

$.getJSON('IslesLagoon_multi.geojson',function(msg){
    multiLayer = msg;
    for(var i=0,iLen=multiLayer.features.length;i<iLen;i++){
        var feature = multiLayer.features[i];
        feature.visible = true;
        islandsCollection[feature.properties.Numero] = feature;
    }
    islands_layer.addData(multiLayer);
    if(!filter.object){
        filter.setObject(multiLayer.features[0].properties);
        filter.minimize(filter.minimized);
    }
    if(!colorControl.object){
        colorControl.setObject(multiLayer.features[0].properties);
        colorControl.minimize(filter.minimized);
    }
    recolorIsles();
});

//$.ajax({
//    dataType: "json",
//    url: 'IslesLagoon_multi.geojson',
//    success: function (file_html) {
//        var multiLayer = msg;
//    
//        for(var i=0,iLen=singleLayer.features.length;i<iLen;i++){
//            var feature = singleLayer.features[i];
//            feature.visible = true;
//            islandsCollection[feature.properties.Numero] = feature;
//        }
//        islands_layer.addData(multiLayer);
//    },
//    async: false
//});