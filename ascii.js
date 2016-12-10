/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

var L = parseInt(readline());
var H = parseInt(readline());
var T = readline().split('');

//printErr('L:' + L + ' H:' + H);
//printErr('T: ' + T + ' length:' + T.length);

for (var i = 0; i < H; i++) {
	var ROW = readline();
	//printErr('row:' + ROW);
    var resultRow = '';
	for (var k = 0; k < T.length; k++) {
		var char = T[k];
		//printErr(char);
		var index;
		if (char <= 'z' && char >= 'a') { //lowercase
			index = char.charCodeAt(0) - 'a'.charCodeAt(0);
		} else if (char <= 'Z' && char >= 'A') {
			index = char.charCodeAt(0) - 'A'.charCodeAt(0);
		} else {
			index = 26; //set it to ?
		}
		//printErr(index);
		resultRow += ROW.substring(index * L, index * L + L);
    }
    print(resultRow);
}




// Write an action using print()
// To debug: printErr('Debug messages...');

//First need to be able to print one char reliably
