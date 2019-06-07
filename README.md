# Creare progetto nuovo 
rails new islands --skip-active-record --skip-keeps --skip-action-mailer \
--skip-action-cable --skip-spring --skip-turbolinks  --skip-coffee \
--skip-test --skip-system-test --skip-bootsnap

#aggiungo gemma gestione meta tags

echo "gem 'meta-tags'" >> Gemfile

bundle install

#creo controller per la pagine home

rails g controller Home index about

#aggiungo le dipendenze javascript al progetto

yarn add jquery --save 

yarn add mapbox-gl --save

yarn install 

il css andrebbe incluso con il tag link, così dice la guida

<link href='https://api.mapbox.com/mapbox-gl-js/v1.0.0/mapbox-gl.css' rel='stylesheet' />

#inzializzare map box

per inizializzare la mappa bisogna usare la seguente funzione js

var mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
 
mapboxgl.accessToken = 'pk.eyJ1Ijoic2VyZW5kcHQiLCJhIjoiY2pubHE4MTBqMTUxcTNrbDc4czB0ZDUwcSJ9.ZIV2n4CBDs6xw_iIu4Sfrw';
var map = new mapboxgl.Map({
container: 'YOUR_CONTAINER_ELEMENT_ID',
style: 'mapbox://styles/mapbox/streets-v11'
});


//per cambiare layer

function switchLayer(layer) {
  map.setStyle('mapbox://styles/mapbox/' + layer);
}

è posibile scegliere tra i seguenti layer di default: 
["streets-v11",
"light-v10",
"dark-v10",
"outdoors-v11",
"satellite-v9"]


