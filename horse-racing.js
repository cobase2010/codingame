/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

var N = parseInt(readline());
var a = [];
//var t0 = new Date().getTime();
for (var i = 0; i < N; i++) {
    var pi = parseInt(readline());
    a.push(pi);
}

a.sort((a, b) => b-a); //TODO: we could improve here.

//now use reduce to find out the closest, reverse sort is safer here.
var gap = a.reduce((prev, cur, index, arr) => {
  var d = arr[index-1] - cur;
  return (d < prev) ? d : prev;
});
// Write an action using print()
// To debug: printErr('Debug messages...');
//var t1 = new Date().getTime();
//printErr('elapsed time:' + (t1-t0) + 'ms');
print(gap);