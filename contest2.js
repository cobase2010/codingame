/**
 * Grab Snaffles and try to throw them through the opponent's goal!
 * Move towards a Snaffle and use your team id to determine where you need to throw it.
 **/

var myTeamId = parseInt(readline()); // if 0 you need to score on the right of the map, if 1 you need to score on the left

var goalX = (myTeamId === 0) ? 16000 : 0;
var goalY = 3750;

var patrolX = (myTeamId === 0) ? 1000 : 15000;
var attackId = (myTeamId === 0) ? 0 : 2;
var defendId = (myTeamId === 0) ? 1 : 3;

//x1 player, x2 object
function inFront(x1, x2) {
    return myTeamId === 0 ? x1 < x2 : x1 > x2;
}

var magic = 0;

// game loop

while (true) {
    magic++;
	var myWizard1 = {}; //holding a list of my wizards
	var myWizard2 = {};
	var snaffles = []; //holding a list of snaffles
    var bludgers = []; //holding a list of bludgers
    var oWizards = [];
    //storing closest snaffle to each wizard

    var closestD1 = 100000;
    var closestD2 = 100000;
	var closestS1 = 0;
    var closestS2 = 0;

    var closestBludger1 = 100000;
    var closestBludger2 = 100000;
	var closestBS1 = 0;
    var closestBS2 = 0;

    var closestO1 = 100000;
    var closestO2 = 100000;
	var closestOS1 = 0;
    var closestOS2 = 0;

    var magicRange = 800;


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

        var entity = {
        	'id': entityId,
        	'x': x,
        	'y': y,
        	'vx': vx,
        	'vy': vy,
        	'state': state
        };
        //need to calculated distance
        var d1 = Math.sqrt((myWizard1.x - entity.x) ** 2 + (myWizard1.y - entity.y) ** 2);
        //var d1 = Math.sqrt((goalX - snaffles[j].x) ** 2 + (goalY - snaffles[j].y) ** 2); //closest to goal
        var d2 = Math.sqrt((myWizard2.x - entity.x) ** 2 + (myWizard2.y - entity.y) ** 2);
        //printErr('dsitance:' + d);
		if (entityType === 'WIZARD' && entityId === attackId) {
			myWizard1 = entity;
		} else if (entityType === 'WIZARD' && entityId === defendId) {
			myWizard2 = entity;
		} else if (entityType === 'SNAFFLE') {	
            snaffles.push(entity);
			if (d1 < closestD1) {
				closestD1 = d1;
				closestS1 = snaffles.length-1; //jth snaffle is the closest
			}
			if (d2 < closestD2) {
				closestD2 = d2;
				closestS2 = snaffles.length-1;
			}
			
		} else if (entityType === 'BLUDGER') {
            bludgers.push(entity)
            if (d1 < closestBludger1) {
				closestBludger1 = d1;
				closestBS1 = bludgers.length-1; //jth snaffle is the closest
			}
			if (d2 < closestBludger2) {
				closestBludger2 = d2;
				closestDS2 = bludgers.length-1;
			}

        } else if (entityType === 'OPPONENT_WIZARD') {
            oWizards.push(entity)
            if (d1 < closestO1) {
				closestO1 = d1;
				closestOS1 = oWizards.length-1; //jth snaffle is the closest
			}
			if (d2 < closestO2) {
				closestO2 = d2;
				closestOS2 = oWizards.length-1;
			}

        }
		//now move 
	}
   
	/*for (var j = 0; j < snaffles.length; j++) {
		var d1 = Math.sqrt((myWizard1.x - snaffles[j].x) ** 2 + (myWizard1.y - snaffles[j].y) ** 2);
		//var d1 = Math.sqrt((goalX - snaffles[j].x) ** 2 + (goalY - snaffles[j].y) ** 2); //closest to goal
        var d2 = Math.sqrt((myWizard2.x - snaffles[j].x) ** 2 + (myWizard2.y - snaffles[j].y) ** 2);
		//printErr('dsitance:' + d);
		if (d1 < closestD1) {
			closestD1 = d1;
			closestS1 = j; //jth snaffle is the closest
		}
		if (d2 < closestD2) {
			closestD2 = d2;
			closestS2 = j;
		}
	}*/
    //printErr('closestD1:' + closestD1 + ' index;' + closestS1);
    // printErr('closestD2:' + closestD2 + ' index;' + closestS2);

	// Write an action using print()
	// To debug: printErr('Debug messages...');
	//for now just move to the first snaffles
	//for attacking wizard1 
	/*var closestD = 100000;
	var closestS = 0;
	for (var j = 0; j < snaffles[i]; j++) {
		var d = Math.sqrt((myWizard1.x - snaffles[j].x) ^ 2 + (myWizard1.y - snaffles[j]) ^ 2);
		if (d < closestD) {
			closestD = d;
			closestS = j; //jth snaffle is the closest
		}
	}*/


	if (myWizard1.state === 1) {
		//printErr('Caught!')
		print('THROW ' + goalX + ' ' + goalY + ' ' + 500);
	} else if (myWizard1.state === 0) {
        
        //printErr('closestB: ' + closestBludger1);
       if (closestBludger1 < magicRange && magic > 10) {
            print('OBLIVIATE ' + bludgers[closestBS1].id);
            magic -= 5;
       } else if (closestO1 < magicRange && magic > 40) {
            print('PETRIFICUS ' + oWizards[closestOS1].id);
            magic -= 10; 
       } else if (closestS1 < magicRange && magic > 40 && !inFront(myWizard1.x, snaffles[closestS1].x)) {
             print('ACCIO ' + snaffles[closestS1].id);
             magic -= 20; 
        } else {
            
		//printErr('for 1: ' + closestD);
		//printErr('x:' + snaffles[i].x + ' vx:' + snaffles[i].vx)
		    print('MOVE' + ' ' + (snaffles[closestS1].x) +
			    ' ' + (snaffles[closestS1].y) + ' ' + 150)
       }
	   // }
    }

	//for defending wizard2

	if (myWizard2.state === 1) {
		print('THROW ' + goalX + ' ' + goalY + ' ' + 500);
	} else if (myWizard2.state === 0) {
		if (closestBludger2 < magicRange && magic > 10) {
			print('OBLIVIATE ' + bludgers[closestBS2].id);
			magic -= 5;
		} else if (closestO2 < magicRange && magic > 40) {
			print('FLIPENDO ' + oWizards[closestOS2].id);
			magic -= 20;
		} else if (closestS2 < magicRange && magic > 40 && !inFront(myWizard1.x, snaffles[closestS1].x)) {
             print('ACCIO ' + snaffles[closestS2].id);
             magic -= 20; 	
		} else { 
			//printErr('for 2: ' + closestD);
			//if (closestD2 < 3000 && (myTeamId === 0 ? snaffles[closestS2].x < 4000 : snaffles[closestS2].x > 12000)) {
				print('MOVE' + ' ' + (snaffles[closestS2].x)  +
					' ' + (snaffles[closestS2].y) + ' ' + 150);
			/*} else { //back to patrol
				//move randomly along defensive line
				var delta = Math.trunc((Math.random() * 2 - 1) * 2000);
				print('MOVE' + ' ' + patrolX + ' ' + (3750 + delta) + ' ' + 150)
			}*/
		}
	}

	// Edit this line to indicate the action for each wizard (0 ≤ thrust ≤ 150, 0 ≤ power ≤ 500)
	// i.e.: "MOVE x y thrust" or "THROW x y power"
}

	