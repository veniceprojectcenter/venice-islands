// icons from https://mapicons.mapsmarker.com/category/markers/restaurants-bars/
// define shared options that will be inherited by all custom icons
var customIcon = L.Icon.extend({
    options: {
        iconAnchor:   [16, 37], // point of the icon which will correspond to marker's location
        popupAnchor:  [0, -37] // point from which the popup should open relative to the iconAnchor
    }
});
// then define the individual icons by feeding in the image URLs
var hotelIcon = new customIcon({iconUrl: 'image/lodging-2.png'});
var churchIcon = new customIcon({iconUrl: 'image/cathedral.png'});
var conventIcon = new customIcon({iconUrl: 'image/convent-2.png'});
var storeIcon = new customIcon({iconUrl: 'image/mall.png'});