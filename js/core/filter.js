var FilterControl = L.Control.extend({
    //div
    //modifyDiv
    //object
    //fieldSelect
    //functionSelect
    //textInput
    //savedFields
    //autoComplete
    
    initialize: function (object, position, modifyDiv) {
        // ...
        if(position){
            L.Util.setOptions(this, {position: position});
        }
        
        this.object = object;
        this.save = {};
        
        this.modifyDiv = modifyDiv;
        this.div = this.div || L.DomUtil.create('div', 'iconBox');
        
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
        position: 'left'
    },

    onAdd: function (map) {
        this.div = this.div || L.DomUtil.create('div', 'iconBox');
        
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
        label.setAttribute('src','image/filter.png');
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
        
        this.fieldSelect = createDropdown(object);
        //this.fieldSelect.multiple = true;
        this.fieldSelect.onchange = function(e){
            that.autoComplete.list = that.getAllValues();
            that.autoComplete.evaluate();
        }
        this.div.appendChild(this.fieldSelect);
            
        
        this.functionSelect = createDropdown(["=","<",">","contains"]);
        this.div.appendChild(this.functionSelect);
            
        this.textInput = document.createElement("INPUT");
        this.textInput.setAttribute("id","iconField");
        this.textInput.onkeypress = function(e){
            var key = e.which || e.keyCode;
            if (key == 27) {  // 27 is the ESC key
                that.onClear(e);
            }
            else if (key == 13) {  // 13 is the Enter key
                if(that.textInput && that.textInput.value != ''){
                   that.onApply(e);
                }
                else{
                    that.onClear(e);
                }
            }
        };
        this.div.appendChild(this.textInput);
        
        this.autoComplete = new Awesomplete(this.textInput,{list: this.getAllValues(),minChars:1});
        
        L.DomEvent.on(this.textInput, 'mousedown', function(event) {
            L.DomEvent.stopPropagation(event);
        });
        L.DomEvent.on(this.textInput, 'mouseup', function(event) {
            L.DomEvent.stopPropagation(event);
        });
        L.DomEvent.on(this.textInput, 'mousemove', function(event) {
            L.DomEvent.stopPropagation(event);
        });
        
        this.minimize(this.minimized);
    },
    
    minimize : function(bool){
        this.minimized = bool;

        this.div.innerHTML = '';

        this.setupImage();
        
        if(bool==false){
            
            this.div.appendChild(this.fieldSelect);
            
            this.div.appendChild(this.functionSelect);
            
            this.div.appendChild(this.textInput);
            
            this.autoComplete = new Awesomplete(this.textInput,{list: this.getAllValues(),minChars:1});
            
            var applyButton = document.createElement("INPUT");
            applyButton.setAttribute("id","iconField");
            applyButton.setAttribute("type", "button");
            applyButton.setAttribute("value","Apply");
            applyButton.onclick = this.onApply;
            applyButton.ondblclick = function(){
                
            }
            this.div.appendChild(applyButton);

            var clearButton = document.createElement("INPUT");
            clearButton.setAttribute("id","iconField");
            clearButton.setAttribute("type", "button");
            clearButton.setAttribute("value","Clear");
            clearButton.onclick = this.onClear;
            this.div.appendChild(clearButton);
            
            var infoButton = document.createElement("INPUT");
            infoButton.setAttribute("id","iconField");
            infoButton.setAttribute("type", "button");
            infoButton.setAttribute("value","Info");
            infoButton.onclick = function(){
                overlayMulti(islands_layer);
            };
            this.div.appendChild(infoButton);
        }
    },
    
    testObject : function(object){
        var fields = this.selectedFields();
        for(var i=0,iLen=fields.length;i<iLen;i++){
            if(object.hasOwnProperty(fields[i])){
                for(var f=0,fLen=this.selectedFunctions().length;f<fLen;f++){
                    switch(this.selectedFunctions()[f]) {
                        case "=":
                            if(object[fields[i]]==this.inputText()){
                                return true;
                            }
                            break;
                        case "<":
                            if(object[fields[i]]<this.inputText()){
                                return true;
                            }
                            break;
                        case ">":
                            if(object[fields[i]]>this.inputText()){
                                return true;
                            }
                            break;
                        case "contains":
                            if(object[fields[i]] && ((object[fields[i]].toString()).toUpperCase()).indexOf(this.inputText().toUpperCase()) > -1)                             {
                                return true;
                            }
                            break;
                        default:
                            return true;
                    }
                }
            }
        }
        return false;
    },
    
    //Get which fields are selected (1st dropdown)
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
    
    //get which functions are selected (2nd dropdown)
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
    
    //get the value of the input textbox
    inputText : function(){
        return this.textInput.value;
    },
        
    getAllValues : function (e){
        
    },
    
    //callback for applying filter (should be overridden using filter.onApply = ___)
    onApply : function(e){
        
    },
    //callback for clearing filter (should be overridden using filter.onClear = ___)
    onClear : function(e){
        
    }
});

//******************************************************************************************************

//Create a dropdown object for use in a filter and apply the user defined style
function createDropdown(object,options){
    var dropdown = document.createElement("SELECT");
    dropdown.setAttribute("id","iconField");
    if(options){
        for(property in options){
            if(options.hasOwnProperty(property)){
                dropdown[property] = options[property];
            }
        }
    }
    
    if(!object){
        return dropdown;
    }
    
    if(object.constructor === Array){
        if(object.length>0){
            for(var i = 0;i<object.length;i++){
                var option = document.createElement("OPTION");
                option.text = lookup(object[i]);
                option.value = object[i];
                dropdown.add(option);
            }
        }
    }
    else if(typeof object === 'object'){
        for(property in object){
            var option = document.createElement("OPTION");
            option.text = lookup(property);
            option.value = property;
            dropdown.add(option);
        }
    }
    else{
        var option = document.createElement("OPTION");
        option.text = lookup(object);
        option.value = object;
        dropdown.add(option);
    }
    
    dropdown.onmousedown = dropdown.ondblclick = L.DomEvent.stopPropagation;
    return dropdown;
}

//********************************************************************************************************

//Create a filter object (put it in the top left and flow left to right)
var fieldsObj = undefined;

var keys = [];
for(var key in islands_layer.layers){
    keys.push(key);
}

if(keys.length>0){
    fieldsObj = islands_layer.layers[keys[0]].feature.properties;
}

var filter = new FilterControl(fieldsObj,'topleft',function(div){
    div.style.clear = 'both';
    div.style.zIndex = 1000;
});
//define onApply behavior
filter.onApply = function(e){
    var islandIndeces = {};
    
    for(var i=0,iLen=feature_layers.length;i<iLen;i++){
        var feature = feature_layers[i].feature;

        if(feature.properties.Numero){
            islandIndeces[feature.properties.Numero] = i;
            if(feature.visible != filter.testObject(feature.properties)){
                feature.visible_changed = true;
                feature.visible = !feature.visible;
            }
        }
    }
    for(var i=0,iLen=feature_layers.length;i<iLen;i++){
        var show = false;
        var feature = feature_layers[i].feature;
        if(!feature.properties.Numero && feature.properties.islands){
            for(var n=0,nLen=feature.properties.islands.length;(n<nLen)&&(show==false);n++){
                if(islandIndeces[feature.properties.islands[n]]){
                    if(feature_layers[islandIndeces[feature.properties.islands[n]]].feature.visible){
                        show = true;
                    }
                }
            }
            if(feature.visible != show){
                feature.visible_changed = true;
                feature.visible = show;
            }
        }
    }
    
    refreshFilter();
    searchControl.refresh();
}
//define onClear behavior
filter.onClear = function(e){
    for(var i=0,iLen=feature_layers.length;i<iLen;i++){
        var feature = feature_layers[i].feature;
        if(feature.visible == false){
            feature.visible_changed = true;
            feature.visible = true;
        }
    }
    refreshFilter();
    recolorIsles();
    searchControl.refresh();
}
filter.getAllValues = function(e){
    var vals = [];
    var fields = filter.selectedFields();
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

map.addControl(filter);
filter.minimize(true);
