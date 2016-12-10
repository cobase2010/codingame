var inputs = readline().split(' ');
var LX = parseInt(inputs[0]);
var LY = parseInt(inputs[1]);
var TX = parseInt(inputs[2]);
var TY = parseInt(inputs[3]);
var steps = [];
if (Math.abs(TX-LX) > Math.abs(TY-LY)) {
    for (var i =0; i < Math.abs(TY - LY); i++) {
        (TY>LY) ? ((TX>LX)?steps.push('NW'):steps.push('NE')) : ((TX>LX)?steps.push('SW'):steps.push('SE'))
    }
    for (var j = 0; j< Math.abs(Math.abs(LX-TX)- Math.abs(TY-LY)); j++) {
        (TX>LX) ? steps.push('W') : steps.push('E');
    }
} else {
    for (var i =0; i < Math.abs(TX - LX); i++) {
        (TX>LX) ? ((TY>LY)?steps.push('NW'):steps.push('SW')) : ((TY>LY)?steps.push('NE'):steps.push('SE'))
    }
    for (var j = 0; j< Math.abs(Math.abs(LY-TY)- Math.abs(TX-LX)); j++) {
        (TY>LY) ? steps.push('N') : steps.push('S');
    }
}
var i = 0;
while (true) {
    var remainingTurns = parseInt(readline());
    print(steps[i]);
    i++;
}