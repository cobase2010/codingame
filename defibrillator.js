/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

var LON = parseFloat(readline().replace(',', '.'));
var LAT = parseFloat(readline().replace(',', '.'));
var N = parseInt(readline());
var defibs = [];
for (var i = 0; i < N; i++) {
    var DEFIB = readline().split(';');
    var defLon = parseFloat(DEFIB[DEFIB.length-2].replace(',', '.'));
    var defLat = parseFloat(DEFIB[DEFIB.length-1].replace(',', '.'));
    //printErr(DEFIB);
    //printErr(defLon + ' ' + defLat);
    defibs.push(
      {
        name: DEFIB[1],
        lon: defLon,
        lat: defLat
      }
    );
}

//printErr(JSON.stringify(defibs));

//now find the closest defibs
var addr = defibs.reduce((prev, cur) => {
  var prevD = distance(LON, LAT, prev.lon, prev.lat);
  var curD = distance(LON, LAT, cur.lon, cur.lat);
  //printErr(prev.name + ':' + prevD);
  //printErr(cur.name + ':' + curD);
  return prevD < curD ? prev : cur;
}).name;

//printErr(addr);
// Write an action using print()
// To debug: printErr('Debug messages...');

print(addr);

//find the distance between two points
function distance(lon1, lat1, lon2, lat2) {
  var x = (lon2 - lon1) * Math.cos((lat1 + lat2)/2);
  var y = lat2 - lat1;
  return Math.sqrt(x**2 + y**2) * 6371;
}