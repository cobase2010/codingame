/**
 * Don't let the machines win. You are humanity's last hope...
 **/

var width = parseInt(readline()); // the number of cells on the X axis
var height = parseInt(readline()); // the number of cells on the Y axis
var lines = []; //2-d array
for (var i = 0; i < height; i++) {
    var line = readline().split(''); // width characters, each either 0 or .
    //printErr(line);
    lines.push(line);
}

// Write an action using print()
// To debug: printErr('Debug messages...');

// Three coordinates: a node, its right neighbor, its bottom neighbor
for (var i = 0; i< height; i++) {
  for (var j =0; j< width; j++) {
    var x1 = -1;
    var y1 = -1;
    var x2 = -1;
    var y2 = -1;
    if (lines[i][j] === '0') { //node exist!
      //first find right node
      var index = lines[i].indexOf('0', j+1);
      if (index !== -1) {
        x1 = i;
        y1 = index;
      }
      
      //var t0 = dateNow();
      index = lines.map(x => x[j]).indexOf('0', i+1);
      if (index !== -1) {
        x2 = index;
        y2 = j;
      } 
      
      //find the down node
     /* for (var k = i+1; k<height; k++) {
        //printErr(lines[k][j] === '0');
        if (lines[k][j] === '0') {
          //printErr('entered');
          x2 = k;
          y2 = j;
          break;
        }
      }*/
     // var t1 = dateNow();
     // printErr('elapsed: ' + (t1-t0) + 'ms');
      print('' + j + ' ' + i + ' ' + y1 + ' ' + x1 + ' ' + y2 + ' ' + x2);
    }
  }
}
