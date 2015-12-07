// icons from https://mapicons.mapsmarker.com
// define shared options that will be inherited by all custom icons
var customIcon = L.Icon.extend({
    options: {
        iconAnchor:   [16, 37], // point of the icon which will correspond to marker's location
        popupAnchor:  [0, -37] // point from which the popup should open relative to the iconAnchor
    }
});
// then define the individual icons by feeding in the image URLs
var hotelIcon = new customIcon({iconUrl: 'image/icons/lodging-2.png'});
var churchIcon = new customIcon({iconUrl: 'image/icons/cathedral.png'});
var conventIcon = new customIcon({iconUrl: 'image/icons/convent-2.png'});
var storeIcon = new customIcon({iconUrl: 'image/icons/mall.png'});
var sewerIcon = new customIcon({iconUrl: 'image/icons/latrine.png'});
var vpcicon = new customIcon({iconUrl: 'image/icons/vpcicon.png'});
var noIcon = new customIcon({iconUrl: 'image/icons/empty.png'});