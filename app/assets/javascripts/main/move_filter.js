function moveLeft(){
  var newParent = document.getElementById('filters');
  var oldParent = document.getElementsByClassName("leaflet-control-layers leaflet-control");
  while (oldParent[0].childNodes.length > 0) {
    newParent.appendChild(oldParent[0].childNodes[0]);
  };
};

function moveRight() {
  var newParent = document.getElementById('filters');
  var oldParent = document.getElementsByClassName("leaflet-top leaflet-left");
  //var oldParent = document.getElementsByClassName("leaflet-control-container")
  var i = 0;
  while (i <= oldParent[0].childNodes.length){
    console.log(oldParent[0].childNodes[i].classList.toString())
    if (oldParent[0].childNodes[i].classList.toString().indexOf("leaflet-control-zoom") == -1){
      newParent.appendChild(oldParent[0].childNodes[i]);
    };
    i += 1;
  };
};

function moveFilter(){
  var oldParent = document.getElementsByClassName("iconBox leaflet-control");
  var newParent = document.getElementById('filters');
  newParent.appendChild(oldParent[0]);
};

function moveLegend(){
  var oldParent = document.getElementsByClassName("legend leaflet-control");
  var newParent = document.getElementById('custom-map-controls-left');
  while (oldParent[0].childNodes.length > 0) {
    newParent.appendChild(oldParent[0].childNodes[0]);
  };
}

$(document).ready(function (){
  moveLeft();
  moveRight();
  moveFilter();
})