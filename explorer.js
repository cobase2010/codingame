/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/



var inputs = readline().split(' ');
var R = parseInt(inputs[0]); // number of rows.
var C = parseInt(inputs[1]); // number of columns.
var A = parseInt(inputs[2]); // number of rounds between the time the alarm countdown is activated and the time the alarm goes off.

// game loop
while (true) {
    var inputs = readline().split(' ');
    var KR = parseInt(inputs[0]); // row where Kirk is located.
    var KC = parseInt(inputs[1]); // column where Kirk is located.
    var gC = -1;
    var gR = -1;
    for (var i = 0; i < R; i++) {
        var ROW = readline(); // C of the characters in '#.TC?' (i.e. one line of the ASCII maze).
        var lC = ROW.indexOf('C');
        if (lC > 0) {
            gR = i;
            gC = lC;
        }
        printErr(ROW);
    }
    foo(gC, gR);

    // Write an action using print()
    // To debug: printErr('Debug messages...');

    print('RIGHT'); // Kirk's next move (UP DOWN LEFT or RIGHT).
}

function foo(x, y) {
    printErr(x + ' ' + y);
}

function explore(map, cC, cR, explored) {
    
}