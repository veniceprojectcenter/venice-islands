// create a legend for the colors
// Create grades using http://colorbrewer2.org/
var legend = L.control({position: 'bottomright'});
var legend_div = L.DomUtil.create('div', 'info legend');

var objectColors;
var gradientColors = ['#f7fcfd','#e0ecf4','#bfd3e6','#9ebcda','#8c96c6','#8c6bb1','#88419d','#810f7c','#4d004b']

legend.grades = [0, 20, 50, 100, 200, 500, 1000, 2000, 3000];

legend.onAdd = function (map) {

    legend.setThresholds(legend.grades);

    return legend_div;  
};

legend.setThresholds = function(thresholds){
    legend.grades = thresholds;
    legend_div.innerHTML='';
    
    for (var i = 0; i < thresholds.length && i < gradientColors.length; i++) {
        legend_div.innerHTML +=
            '<i style="background:' + gradientColors[i] + '"></i> ' +
            thresholds[i] + (thresholds[i + 1] ? '&ndash;' + thresholds[i + 1] + '<br>' : '+');
    }
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
        this.div = this.div || L.DomUtil.create('div', 'info legend');
        
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
                // look for the field in objectColors
                contents = $.grep(objectColors, function(e){ return e.id == value; });
                // if an object with the same val hasn't already been colored, get a color
                if (contents.length > 0){
                    return contents[0].color;
                } else {
                    // otherwise, use the color from the object with the same val
                    var temp = {id:value,color:generateRandomColors()};
                    objectColors.push(temp);
                    return temp.color;
                }
            } 
            if(fxns=="gradient"){
                if(value!=undefined){
                    for (var i = Math.min(this.thresholds.length,gradientColors.length); i >= 0; i--) {
                        if(value > this.thresholds[i]){
                            return gradientColors[i];
                        }
                    }
                    return '#ffffff';
                }
            }
            // if NOT opaqueflag and field is empty, color pinkish
            return 'rgba(255, 0, 0, 0.64)';
        }
        
        //TODO: given an object(or value), get its color
        //if selected function is random, return random color
        //otherwise, color will depend on selectedField, the value of that field, and thresholds set using setGradient()
        //???? is it possible to make color a continuous function of value ????
    },
    
    // colorControl.setGradient()
    setGradient : function(){
        //TODO: store thresholds of different gradient colors using array of all values
        //use "this.getAllValues()" to determine range and  "this.thresholds";
        //Many ways: find total range split into equal sized ranges
        //           sort values in order and split into equal sized groups
        
        legend.setThresholds(this.thresholds);
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
    
    applyStyle(dropdown,ColorElement_style(option));
    
    if(!object){
        return dropdown;
    }
    
    if(object.constructor === Array){
        if(object.length>0){
            for(var i = 0;i<object.length;i++){
                var option = document.createElement("OPTION");
                option.text = object[i];
                option.value = object[i];
                dropdown.add(option);
            }
        }
    }
    else if(typeof object === 'object'){
        for(property in object){
            var option = document.createElement("OPTION");
            option.text = property;
            option.value = property;
            dropdown.add(option);
        }
    }
    else{
        var option = document.createElement("OPTION");
        option.text = property;
        option.value = property;
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

//
//function applyColor(){
//    //if gradient coloring is selected
//    if(colorControl.selectedFunctions()[0]==='gradient'){
//        //iterate through all islands. generate array of the values of the selected field
//    
//        //use that array to set the gradient
//    }
//    
//    //iterate through all island layers and set style = colorControl.getStyle();   
//    
//    //apply new styles?
//}
//function clearColor(){
//    //iterate through all island layers and set style = some style   
//}

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
    if(colorControl.selectedFunctions()[0]!="random"){
        colorControl.setGradient();
        legend.addTo(map);
    }
    else if(legend._map){
        legend.removeFrom(map);
    }
    objectColors = [];
    //document.getElementById("legendButton").addEventListener("click", hideColors);
    recolorIsles();
}
colorControl.onClear = function(e){
    opaqueFlag=true;
    if(legend._map){
        legend.removeFrom(map);
    }
    objectColors = [];
    //document.getElementById("legendButton").addEventListener("click", hideColors);
    recolorIsles();
}

map.addControl(colorControl);
colorControl.minimize(true);
colorControl.onClear();
