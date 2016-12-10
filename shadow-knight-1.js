/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

var inputs = readline().split(' ');
var W = parseInt(inputs[0]); // width of the building.
var H = parseInt(inputs[1]); // height of the building.
var N = parseInt(readline()); // maximum number of turns before game over.
var inputs = readline().split(' ');
var X0 = parseInt(inputs[0]);
var Y0 = parseInt(inputs[1]);
var minX = 0;
var minY = 0;
var maxX = W-1;
var maxY = H-1;

//printErr(W + ' ' + H);
// game loop
while (true) {
	var bombDir = readline(); // the direction of the bombs from batman's current location (U, UR, R, DR, D, DL, L or UL)
	//printErr(bombDir + ' ' + minX + ' ' + maxX + ' ' + minY + ' ' + maxY);

	// Write an action using print()
	// To debug: printErr('Debug messages...');
  //floor towards the smaller end, round towards the bigger end
	switch (bombDir) {
		case 'U':
			{
				//keep the same x
        maxY = Y0; //now Y0 is the new maxY
        Y0 = minY + Math.floor((maxY - minY)/2);
        break;
			}
		case 'UR':
			{
        minX = X0;
        maxY = Y0
        X0 = minX + Math.round((maxX - minX)/2);
        Y0 = minY + Math.round((maxY-minY)/2);
        break;
			}
		case 'R':
			{
				minX = X0;
        X0 = minX + Math.round((maxX - minX)/2);
        break;
			}
		case 'DR':
			{
				minX = X0;
        minY = Y0;
        X0 = minX + Math.round((maxX - minX)/2);
        Y0 = minY + Math.round((maxY-minY)/2);
        break;
			}
		case 'D':
			{
				minY = Y0;
        Y0 = minY + Math.round((maxY-minY)/2);
        break;
			}
		case 'L':
			{
				maxX = X0;
        X0 = minX + Math.floor((maxX - minX)/2);
        break;
			}
		case 'UL':
			{
				maxX = X0;
        maxY = Y0;
        X0 = (minX + Math.floor((maxX - minX)/2)); //< X0) ? (minX + Math.round((maxX - minX)/2)) : X0-1;
        Y0 = minY + Math.floor((maxY-minY)/2);
        break;
			}
    case 'DL': 
      {
        maxX = X0;
        minY = Y0;
         X0 = minX + Math.floor((maxX - minX)/2);
        Y0 = minY + Math.round((maxY-minY)/2);
        break;
      }
		default:
			{
				break;
			}
	}

  //printErr(bombDir + ' ' + minX + ' ' + maxX + ' ' + minY + ' ' + maxY);
	// the location of the next window Batman should jump to.
	print(X0 + ' ' + Y0);
}