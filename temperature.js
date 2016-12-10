/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

var n = parseInt(readline()); // the number of temperatures to analyse
var temps = readline(); // the n temperatures expressed as integers ranging from -273 to 5526

var ar = temps.split(' ');
// Write an action using print()
// To debug: printErr('Debug messages...');

var delta = 5527;
var num = 0;

for (var i=0; i<n; i++) {
    if (Math.abs(ar[i]) < Math.abs(delta)) {
        delta = ar[i];
        num = ar[i]
    } else if (Math.abs(ar[i]) === Math.abs(delta)) {
        if (ar[i] > 0) {
            delta = ar[i]; //switch to a positive number anyway
            num = ar[i];
        }
    }
}
print(num);

/*
var count = readline(); // the number of temperatures to analyse
var temps = readline().split(' '); // the n temperatures expressed as integers ranging from -273 to 5526

var sortedTemps = temps.sort((a, b) => Math.abs(a) - Math.abs(b) || b - a);
printErr(sortedTemps);

var result = sortedTemps[0] || 0;

print(result);
*/