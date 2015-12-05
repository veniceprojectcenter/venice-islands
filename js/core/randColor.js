// array used for keeping track of what items are randomly colored
var objectColors;

function generateRandomColors() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}

function applyRandomColors(field,value){
    // look for the field in objectColors
    var contents = $.grep(objectColors, function(e){ return e.id == value; });
    // reset gradient to default color for next time it's used
    gradientColorIndex=gradientColors.length-1; 
    // and update the value of tempFields
    tempField = field;

    // if an object with the same val has already been colored, get the color
    if (contents.length > 0){
        return contents[0].color;
    } else {
        // otherwise, make a new color for it 
        var temp = {id:value,color:generateRandomColors()};
        objectColors.push(temp);
        return temp.color;
    }
}