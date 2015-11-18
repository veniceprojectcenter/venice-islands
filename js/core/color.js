var ColorControl = L.Control.extend({
    //div
    //modifyDiv
    //object
    //fieldSelect
    //functionSelect
    //thresholds[]
    
    initialize: function (object, position, modifyDiv) {
        // ...
        if(position){
            L.Util.setOptions(this, {position: position});
        }
        
        this.object = object;
        
        this.modifyDiv = modifyDiv;
    },
    
    minimized: false,
    
    options: {
        position: 'topleft'
    },

    onAdd: function (map) {
        this.div = L.DomUtil.create('div', 'info legend');
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
        
        this.div.onclick = function(e){
            if(that.minimized){
                that.minimize(false);
            }
            if(e.stopPropagation){
                e.stopPropagation();
            }
            return false;
        }
        this.div.ondblclick = function(e){
            that.minimize(!that.minimized);
            if(e.stopPropagation){
                e.stopPropagation();
            }
            return false;
        }
        
        this.setupImage();
        
        this.fieldSelect = createDropdown(object);
        //this.fieldSelect.multiple = true;
        this.div.appendChild(this.fieldSelect);
        this.functionSelect = createDropdown(["random","gradient"]);
        this.div.appendChild(this.functionSelect);
        
        var applyButton = document.createElement("INPUT");
        applyStyle(applyButton,ColorElement_style(applyButton));
        applyButton.setAttribute("type", "button");
        applyButton.setAttribute("value","Apply");
        applyButton.onclick = this.onApply;

        this.div.appendChild(applyButton);
        
        var clearButton = document.createElement("INPUT");
        applyStyle(clearButton,ColorElement_style(clearButton));
        clearButton.setAttribute("type", "button");
        clearButton.setAttribute("value","Clear");
        clearButton.onclick = this.onClear;
        this.div.appendChild(clearButton);
    },
    
    minimize : function(bool){
        this.minimized = bool;
        if(bool){
            this.div.innerHTML = '';
            applyStyle(this.div,Color_style(this.div));

            this.setupImage();
        }
        else{
            this.setObject(this.object);
        }
    },
    
    getColor : function(object){
        //TODO: given an object(or value), get its color
        //if selected function is random, return random color
        //otherwise, color will depend on selectedField, the value of that field, and thresholds set using setGradient()
        //???? is it possible to make color a continuous function of value ????
    },
    
    setGradient : function(array){
        //TODO: store thresholds of different gradient colors using array of all values
        //Many ways: find total range split into equal sized ranges
        //           sort values in order and split into equal sized groups
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

function applyColor(){
    //if gradient coloring is selected
    if(colorControl.selectedFunctions()[0]==='gradient'){
        //iterate through all islands. generate array of the values of the selected field
    
        //use that array to set the gradient
    }
    
    //iterate through all island layers and set style = colorControl.getStyle();   
    
    //apply new styles?
}
function clearColor(){
    //iterate through all island layers and set style = some style   
}

var colorControl = new ColorControl(singleLayer.features[0].properties,'topleft',function(div){
    div.style.clear = 'both';
});
colorControl.onApply = function(e){
    alert("apply "+colorControl.selectedFields());
}
colorControl.onClear = function(e){
    alert("clear "+colorControl.selectedFunctions());
}
map.addControl(colorControl);
colorControl.minimize(true);