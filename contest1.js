/**
 * Grab Snaffles and try to throw them through the opponent's goal!
 * Move towards a Snaffle and use your team id to determine where you need to throw it.
 **/

var myTeamId = parseInt(readline()); // if 0 you need to score on the right of the map, if 1 you need to score on the left
var myWizards = []; //holding a list of my wizards
var snaffles = []; //holding a list of snaffles
var goalX = (myTeamId === 0) ? 16000 : 0;
var goalY = 3750;

// game loop
while (true) {
    var entities = parseInt(readline()); // number of entities still in game
    for (var i = 0; i < entities; i++) {
        var inputs = readline().split(' ');
        var entityId = parseInt(inputs[0]); // entity identifier
        var entityType = inputs[1]; // "WIZARD", "OPPONENT_WIZARD" or "SNAFFLE" (or "BLUDGER" after first league)
        var x = parseInt(inputs[2]); // position
        var y = parseInt(inputs[3]); // position
        var vx = parseInt(inputs[4]); // velocity
        var vy = parseInt(inputs[5]); // velocity
        var state = parseInt(inputs[6]); // 1 if the wizard is holding a Snaffle, 0 otherwise
        
        if (entityType === 'WIZARD') {
            myWizards.push({
                'id': entityId,
                'x': x,
                'y': y,
                'vx': vx,
                'vy': vy,
                'state': state
            });
        } else if (entityType === 'SNAFFLE') {
            snaffles.push({
                'id': entityId,
                'x': x,
                'y': y,
                'vx': vx,
                'vy': vy
               // 'state': state
            });
        } 
        //now move 
    }
    for (var i = 0; i < myWizards.length; i++) {

        // Write an action using print()
        // To debug: printErr('Debug messages...');

        //for now just move to the first snaffles
            
            if (myWizards[i].state === 1) {
                printErr('Caught!')
                print('THROW ' + goalX + ' ' + goalY + ' ' + 400);
            } else {
            //printErr('x:' + snaffles[i].x + ' vx:' + snaffles[i].vx)
                print ('MOVE' + ' ' + (snaffles[i].x + snaffles[i].vx) +
                    ' ' + (snaffles[i].y + snaffles[i].vy) + ' ' + 100)
            }
        

        // Edit this line to indicate the action for each wizard (0 ≤ thrust ≤ 150, 0 ≤ power ≤ 500)
        // i.e.: "MOVE x y thrust" or "THROW x y power"
       
    }
}