// create a legend for the colors
// Create grades using http://colorbrewer2.org/
var legend = L.control({position: 'bottomright'});
var legend_div = L.DomUtil.create('div', 'legend');
 // Disable dragging when user's cursor enters the element
legend_div.addEventListener('mouseover', function () {
    map.dragging.disable();
    map.scrollWheelZoom.disable();
});
// Re-enable dragging when user's cursor leaves the element
legend_div.addEventListener('mouseout', function () {
    map.dragging.enable();
    map.scrollWheelZoom.enable();
});

legend.minimize = function(bool){
    if(bool!=undefined){
        legend.minimized=bool;
        legend_div.innerHTML = legend.minimized ? legend.miniHtml : legend.fullHtml;
        if(bool){
            map.dragging.enable();
            map.scrollWheelZoom.enable();
        }
    }
}

legend.minimized = false;
legend.fullHtml;
legend.miniHtml;

// color gradients
//var gradientColors = [
//    ['#edf8fb','#b3cde3','#8c96c6','#8856a7','#810f7c'],
//    ['#fef0d9','#fdcc8a','#fc8d59','#e34a33','#b30000'],
//    ['#f1eef6','#d7b5d8','#df65b0','#dd1c77','#980043'],
//    ['#edf8fb','#b2e2e2','#66c2a4','#2ca25f','#006d2c']];
var gradientColors = [
    ['#f7fcfd','#e0ecf4','#bfd3e6','#9ebcda','#8c96c6','#8c6bb1','#88419d','#6e016b'],
    ['#fff7ec','#fee8c8','#fdd49e','#fdbb84','#fc8d59','#ef6548','#d7301f','#990000'],
    ['#f7f4f9','#e7e1ef','#d4b9da','#c994c7','#df65b0','#e7298a','#ce1256','#91003f'],
    ['#f7fcfd','#e5f5f9','#ccece6','#99d8c9','#66c2a4','#41ae76','#238b45','#005824'],
    ['#4575b4','#74add1','#abd9e9','#e0f3f8','#fee090','#fdae61','#f46d43','#d73027']
]
var tempField; // used for switching between gradients
var gradientColorIndex = 0; // used for switching between gradients (gradientColors[c][x])

var gradientFlag=0;

// array used for storing values that correspond to each gradient color
legend.grades = [];

legend.onAdd = function (map) {

    //legend.setThresholds(legend.grades);

    return legend_div;  
};

legend_div.onclick = function(e){
    legend.minimize(!legend.minimized);
}

legend.setThresholds = function(thresholds){
    legend.grades = thresholds;
    legend.miniHtml='<center><b>'+dictionary(colorControl.appliedField)+'</b></center>';
    
    legend.fullHtml = legend.miniHtml;
    for (var i = 0; i < thresholds.length && i < gradientColors[gradientColorIndex].length; i++) {
        legend.fullHtml +=
            '<i style="background:' + gradientColors[gradientColorIndex][i] + '"></i> ' +
            thresholds[i] + (thresholds[i + 1] != undefined ? '&ndash;' + thresholds[i + 1] + '<br>' : '+');
    }
    
    legend.minimize(legend.minimized);
}

legend.setValues = function(objColors){
    legend.miniHtml='<center><b>'+dictionary(colorControl.appliedField)+'</b></center>';
    legend.fullHtml = legend.miniHtml;
    for (var i = 0; i < objColors.length; i++) {
        legend.fullHtml +=
            '<i style="background:' + objColors[i].color + '"></i> ' +
            objColors[i].id + (objColors[i + 1] != undefined ? '<br>' : '');
    }
    legend.minimize(legend.minimized);
}

// used to sort an array from lowest-highest
function sortNumber(a,b)
{
  return a - b;
}

//**********************************************************************************************
var ColorControl = L.Control.extend({
    //div
    //modifyDiv
    //object
    //fieldSelect
    //functionSelect
    //thresholds[]
    //appliedField
    //appliedFunction
    
    initialize: function (object, position, modifyDiv) {
        // ...
        if(position){
            L.Util.setOptions(this, {position: position});
        }
        
        this.object = object;
        this.thresholds = legend.grades;
        this.modifyDiv = modifyDiv;
        this.div = this.div || L.DomUtil.create('div', 'info');
        
        //on click, stop propogation
        this.div.onclick = function(e){
            if(e.stopPropagation){
                e.stopPropagation();
            }
            return false;
        }
        //on double click, stop propogation
        this.div.ondblclick = function(e){
            if(e.stopPropagation){
                e.stopPropagation();
            }
            return false;
        }
    },
    
    minimized: false,
    
    options: {
        position: 'topleft'
    },

    onAdd: function (map) {
        //div.innerHTML = '<select><option>1</option><option>2</option><option>3</option></select>';
        
        //this.setObject(["a",1,"b"]);
        this.setObject(this.object);
        
        if(this.modifyDiv){
            this.modifyDiv(this.div);
        }
        return this.div;
    },
    
    setupImage : function(){
        var that = this;
        
        var labelDiv = document.createElement("DIV");
        var label = document.createElement("IMG");
        label.setAttribute('src','image/color.png');
        applyStyle(labelDiv,FilterElement_style(labelDiv));
        labelDiv.style.float = 'left';
        labelDiv.onclick = function(e){
            that.minimize(!that.minimized);
            if(e.stopPropagation){
                e.stopPropagation();
            }
            return false;
        }
        labelDiv.appendChild(label);
        this.div.appendChild(labelDiv);
    },
    
    setObject : function(object){
        var that = this;
        
        this.div.innerHTML = '';
        this.object = object;
        applyStyle(this.div,Color_style(this.div));
        
        this.setupImage();
        
        this.fieldSelect = createDropdown(object);
        this.div.appendChild(this.fieldSelect);
        
        this.appliedField = this.selectedFields()[0];
        
        this.functionSelect = createDropdown(["random","gradient"]);
        this.div.appendChild(this.functionSelect);
        
        this.appliedFunction = this.selectedFunctions()[0];
        
        this.minimize(this.minimized);
    },
    
    minimize : function(bool){
        var that = this;
        this.minimized = bool;
        
        this.div.innerHTML = '';
        applyStyle(this.div,Color_style(this.div));

        this.setupImage();
        
        if(bool==false){
            
            this.div.appendChild(this.fieldSelect);
            
            this.div.appendChild(this.functionSelect);
            
            var applyButton = document.createElement("INPUT");
            applyStyle(applyButton,FilterElement_style(applyButton));
            applyButton.setAttribute("type", "button");
            applyButton.setAttribute("value","Apply");
            applyButton.onclick = function(e){
                that.appliedFunction = that.selectedFunctions()[0];
                that.appliedField = that.selectedFields()[0];
                that.onApply(e);
            }
            this.div.appendChild(applyButton);

            var clearButton = document.createElement("INPUT");
            applyStyle(clearButton,FilterElement_style(clearButton));
            clearButton.setAttribute("type", "button");
            clearButton.setAttribute("value","Clear");
            clearButton.onclick = this.onClear;
            this.div.appendChild(clearButton);
        }
    },
    
    // colorControl.getColor()
    getColor : function(props){
        
        var value = props[this.appliedField];
        var fxns = this.appliedFunction;
        if(opaqueFlag){
            return 'rgba(0,0,0,0)';
        } else{
            if(fxns=="random"){
               return applyRandomColors(this.appliedField,value);
            } 
            if(fxns=="gradient"){
                // add a gradient
                this.setGradient;
                // and update the value of tempFields
                tempField = this.appliedField;
                if(value!=undefined){
                    for (var i = Math.min(this.thresholds.length,gradientColors[gradientColorIndex].length)-1; i >= 0; i--) {
                        if(value >= this.thresholds[i]){
                            return gradientColors[gradientColorIndex][i];
                        }
                    }
                    // if the field isn't a number, apply random colorization to it
                    return applyRandomColors(this.appliedField,value);
                }
            }
            // if NOT opaqueflag and field is empty, color clear
            return 'rgba(0,0,0,0)';
        }
    },
    
    setGradient : function(){
       
        var field = this.appliedField;
        var arr = $.map(islandsCollection, function(o){return o.properties[field];});
        
        if(typeof arr[0] == "string"){ 
            gradientFlag = 1;
            return; // indicate failure
        }
        
//        var maximum = Math.max.apply(this,arr);
//        var minimum = Math.min.apply(this,arr);
//       
//        legend.grades = [];
//        
//        // sort the array of values from min-max
//        arr = arr.sort(sortNumber);
//        // find the index for each quartile
//        // see https://en.wikipedia.org/wiki/Quartile 
//        // I changed the max/min outliers so it'd display better
//        var Q1 = Math.ceil(0.25*arr.length);
//        var Q3 = Math.ceil(0.75*arr.length);
//        var Qlow = Math.ceil(0.05*arr.length);
//        var Qhigh = Math.ceil(0.95*arr.length);
//        // set the gradient based on the array value for each percentile
//        legend.grades = [minimum, arr[Qlow], arr[Q1], arr[Q3], arr[Qhigh]];
        
        var stats = new geostats(arr);
        var a = stats.getClassJenks(8);
        
        legend.grades = stats.bounds;
        
        legend.setThresholds(legend.grades);
        this.thresholds = legend.grades;
        
        // log things for debug
//        console.log(field);
//        console.log(arr);
//        console.log(maximum);
//        console.log(minimum);
//        console.log(this.thresholds);
//        console.log(IQR);
//        console.log(Qlow);
//        console.log(Qhigh);
//        console.log(c);
        
        // change the gradient if apply is hit for the same field
        // if not, keep it the same
        if (colorControl.selectedFields()[0] == tempField){
            if(gradientColorIndex<(gradientColors.length-1)) gradientColorIndex++;
            else gradientColorIndex = 0;
        } else gradientColorIndex = 0; 
        
        gradientFlag = 0; //indicate success
        
    },
    
    selectedFields : function(){
        var items = [];
        if(!this.fieldSelect){
            return items;
        }
        
        if(this.fieldSelect.multiple){
            for(var i=0,iLen=this.fieldSelect.options.length;i<iLen;i++){
                if(this.fieldSelect.options[i].selected){
                    items.push(this.fieldSelect.options[i].value||this.fieldSelect.option[si].text);
                }
            }
        }
        else{
            var i= this.fieldSelect.selectedIndex;
            if(i<0){
                return items;
            }
            items.push(this.fieldSelect.options[i].value||this.fieldSelect.options[i].text);
        }
        return items;
    },
    
    selectedFunctions : function(){
        var items = [];
        if(!this.functionSelect){
            return items;
        }
        
        if(this.functionSelect.multiple){
            for(var i=0,iLen=this.functionSelect.options.length;i<iLen;i++){
                if(this.functionSelect.options[i].selected){
                    items.push(this.functionSelect.options[i].value||this.functionSelect.options[i].text);
                }
            }
        }
        else{
            var i= this.functionSelect.selectedIndex;
            if(i<0){
                return items;
            }
            items.push(this.functionSelect.options[i].value||this.functionSelect.options[i].text);
        }
        return items;
    },
    
    //*********THE BELOW FUNCTIONS MUST BE OVERRIDEN BY THE AUTHOR TO MAKE THE CONTROL WORK AS INTENDED*********//
    
    getAllValues : function(e){
        
    },
    onApply : function(e){
        
    },
    onClear : function(e){
        
    }
});

function createDropdown(object,options){
    var dropdown = document.createElement("SELECT");
    if(options){
        for(property in options){
            if(options.hasOwnProperty(property)){
                dropdown[property] = options[property];
            }
        }
    }
    
    applyStyle(dropdown,FilterElement_style(option));
    
    if(!object){
        return dropdown;
    }
    
    if(object.constructor === Array){
        if(object.length>0){
            for(var i = 0;i<object.length;i++){
                var option = document.createElement("OPTION");
                option.text = dictionary(object[i]);
                option.value = object[i];
                dropdown.add(option);
            }
        }
    }
    else if(typeof object === 'object'){
        for(property in object){
            var option = document.createElement("OPTION");
            option.text = dictionary(property);
            option.value = property;
            dropdown.add(option);
        }
    }
    else{
        var option = document.createElement("OPTION");
        option.text = dictionary(object);
        option.value = object;
        dropdown.add(option);
    }
    
    dropdown.onmousedown = dropdown.ondblclick = L.DomEvent.stopPropagation;
    return dropdown;
}

function applyStyle(feature,style){
    for(property in style){
        feature.style[property] = style[property];
    }
}

//********************************************************************************************************

//Create a color object (put it in the top left)
var fieldsObj = undefined;

var keys = [];
for(var key in islands_layer.layers){
    keys.push(key);
}

if(keys.length>0){
    fieldsObj = islands_layer.layers[keys[0]].feature.properties;
}

var colorControl = new ColorControl(fieldsObj,'topleft',function(div){
    div.style.clear = 'both';
});

colorControl.getAllValues = function(e){
    var vals = [];
    var fields = colorControl.selectedFields();
    for(var i=0,iLen=feature_layers.length;i<iLen;i++){
        var feature = feature_layers[i].feature;
        for(var f=0,fLen=fields.length;f<fLen;f++){
            if(feature.properties.hasOwnProperty(fields[f])){
                var value = feature.properties[fields[f]];
                value = (value!=null && value!=undefined) ? value.toString() : 'null';
                if(vals.indexOf(value)==-1){
                    vals.push(value);
                }
            }
        }
    }
    return vals;
}

colorControl.onApply = function(e){
    opaqueFlag=false;
    if(legend._map){
        legend.removeFrom(map);
    }
    if(colorControl.selectedFunctions()[0]!="random"){
        colorControl.setGradient();
        objectColors = []; // discard random colors that have been saved
        recolorIsles();
        
        if (gradientFlag == 1){
            objectColors=objectColors.sort(function(obj1,obj2){
                return obj1.id-obj2.id;
            });
            legend.setValues(objectColors);
        }
        else{
            legend.setThresholds(legend.grades);
        }
    }
    else{
        objectColors = []; // discard random colors that have been saved
        recolorIsles();
        objectColors=objectColors.sort(function(obj1,obj2){
            return obj1.id-obj2.id;
        });
        legend.setValues(objectColors);
        legend.addTo(map);
    }
    legend.addTo(map);
}
colorControl.onClear = function(e){
    opaqueFlag=true;
    if(legend._map){
        legend.removeFrom(map);
    }
    objectColors = []; // discard random colors that have been saved
    recolorIsles();
    gradientColorIndex=gradientColors.length-1; 
}

map.addControl(colorControl);
colorControl.minimize(true);
colorControl.onClear();