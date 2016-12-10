/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

//A point on the map.
class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	//Input: Point p
	distance2(p) {
		return Math.pow((p.x - this.x), 2) + Math.pow((p.y - this.y), 2);
	}

	distance(p) {
		return Math.sqrt(this.distance2(p));
	}

	//It allows us to find the closest point on a line (described by two points) to another point.
	closest(a, b) {
		var da = b.y - a.y;
		var db = a.x - b.x;
		var c1 = da * a.x + db * a.y;
		var c2 = -db * this.x + da * this.y;
		var det = da * da + db * db;
		var cx = 0;
		var cy = 0;

		if (det != 0) {
			cx = (da * c1 - db * c2) / det;
			cy = (da * c2 + db * c1) / det;
		} else {
			// The point is already on the line
			cx = this.x;
			cy = this.y;
		}

		return new Point(cx, cy);
	}

	print() {
		return `x: ${this.x} y: ${this.y}`;
	}
}

class Collision {
	constructor(a, b, t) {
		this.a = a;
		this.b = b;
		this.t = t;
	}
	print() {
		return `Collision-a: ${this.a.print()} b: ${this.b.print()} t: ${this.t}`;
	}

}

class Unit extends Point {
	constructor(id, x, y, radius, vx, vy) {
		super(x, y);
		this.id = id;
		this.radius = radius;
		this.vx = vx;
		this.vy = vy;
	}

	collision(u) {
		// Square of the distance
		var dist = super.distance2(u);

		// Sum of the radii squared
		var sr = (this.radius + u.radius) * (this.radius + u.radius);

		// We take everything squared to avoid calling sqrt uselessly. It is better for performances

		if (dist < sr) {
			// Objects are already touching each other. We have an immediate collision.
			return new Collision(this, u, 0.0);
		}

		// Optimisation. Objects with the same speed will never collide
		if (this.vx === u.vx && this.vy === u.vy) {
			return null;
		}

		// We place ourselves in the reference frame of u. u is therefore stationary and is at (0,0)
		var x = this.x - u.x;
		var y = this.y - u.y;
		var myp = new Point(x, y);
		var vx = this.vx - u.vx;
		var vy = this.vy - u.vy;
		var up = new Point(0, 0)

		// We look for the closest point to u (which is in (0,0)) on the line described by our speed vector
		var p = up.closest(myp, new Point(x + vx, y + vy));

		// Square of the distance between u and the closest point to u on the line described by our speed vector
		var pdist = up.distance2(p);

		// Square of the distance between us and that point
		var mypdist = myp.distance2(p);

		// If the distance between u and this line is less than the sum of the radii, there might be a collision
		if (pdist < sr) {
			// Our speed on the line
			var length = Math.sqrt(vx * vx + vy * vy);

			// We move along the line to find the point of impact
			var backdist = Math.sqrt(sr - pdist);
			p.x = p.x - backdist * (vx / length);
			p.y = p.y - backdist * (vy / length);

			// If the point is now further away it means we are not going the right way, therefore the collision won't happen
			if (myp.distance2(p) > mypdist) {
				return null;
			}

			pdist = p.distance(myp);

			// The point of impact is further than what we can travel in one turn
			if (pdist > length) {
				return null;
			}

			// Time needed to reach the impact point
			var t = pdist / length;

			return new Collision(this, u, t);
		}

		return null;
	}
	bounce(u) {}

	print() {
		return `Point-id: ${this.id} x: ${this.x} y: ${this.y} radius: ${this.radius}, vx: ${this.vx}, vy: ${this.vy}`
	}
}

class Checkpoint extends Unit {
	constructor(id, x, y, radius) {
		super(id, x, y, radius, 0, 0);
	}
	bounce(u) {}
}

class Pod extends Unit {
	constructor(id, x, y, radius, vx, vy, angle, nextCheckpointId, checkPointX, checkPointY, checked, timeout, partner, shield) {
		super(id, x, y, radius, vx, vy);
		this.angle = angle;
		this.nextCheckpointId = nextCheckpointId;
		this.checkPointX = checkPointX;
		this.checkPointY = checkPointY;
		this.checked = checked || 0;
		this.timeout = timeout;
		this.partner = partner;
		this.shield = shield;
	}
	print() {
			return `Point-id: ${this.id} x: ${this.x} y: ${this.y} angle: ${this.angle} radius: ${this.radius}, vx: ${this.vx}, vy: ${this.vy}`
		}
		//Applying the move
	apply(move) {
		this.rotateAngle(move.angle);
		this.boost(move.thrust);
	}
	clone() {
			return new Pod(this.id, this.x, this.y, this.radius, this.vx, this.vy,
				this.angle, this.nextCheckpointId, this.checkPointX, this.checkPointY,
				this.checked, this.timeout, this.partner, this.shield);
		}
		//angle to point p
	getAngle(p) {
		var d = this.distance(p);
		var dx = (p.x - this.x) / d;
		var dy = (p.y - this.y) / d;

		//Simple trigonometry. We multiply by 180.0/PI to convert radiants to degrees
		var a = Math.acos(dx) * 180.0 / Math.PI;

		//If the point I want is below me, I have to shift the angle for it to be correct
		if (dy < 0) {
			a = 360.0 - a;
		}
		return a;
	}

	diffAngle(p) {
			var a = this.getAngle(p);

			// To know whether we should turn clockwise or not we look at the two ways and keep the smallest
			// The ternary operators replace the use of a modulo operator which would be slower
			var right = this.angle <= a ? a - this.angle : 360 - this.angle + a;
			var left = this.angle >= a ? this.angle - a : this.angle + 360 - a;

			if (right < left) {
				return right;
			} else {
				// We return a negative angle if we must rotate to left
				return -left;
			}
		}
		//Only for bronze and silver leagues as the angle is not given
		//-180 >= angleToP <= 180
	calculateAngle(p, angleToP) {
		var a = this.getAngle(p);
		var b = 0;
		//turning right (positive) or turning left (negative)
		if (angleToP >= 0) {
			b = a > angleToP ? (a - angleToP) : 360 + a - angleToP;
		} else { //turning left
			b = (a - angleToP);
		}
		if (b >= 360) b -= 360;
		this.angle = b;
	}

	rotateAngle(a) {
		// Can't turn by more than 18° in one turn
		if (a > 18.0) {
			a = 18.0;
		} else if (a < -18.0) {
			a = -18.0;
		}

		this.angle += a;

		// The % operator is slow. If we can avoid it, it's better.
		if (this.angle >= 360.0) {
			this.angle = this.angle - 360.0;
		} else if (this.angle < 0.0) {
			this.angle += 360.0;
		}
	}
	rotate(p) {
		a = this.diffAngle(p);
		this.rotateAngle(a);
	}

	boost(thrust) {
		// Don't forget that a pod which has activated its shield cannot accelerate for 3 turns
		if (this.shield) {
			return;
		}

		// Conversion of the angle to radiants
		var ra = this.angle * Math.PI / 180.0;

		// Trigonometry
		this.vx += Math.cos(ra) * thrust;
		this.vy += Math.sin(ra) * thrust;
	}

	move(t) {
		this.x += this.vx * t;
		this.y += this.vy * t;
	}

	end() {
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		this.vx = Math.trunc(this.vx * 0.85);
		this.vy = Math.trunc(this.vy * 0.85);

		// Don't forget that the timeout goes down by 1 each turn. It is reset to 100 when you pass a checkpoint
		this.timeout -= 1;
	}

	play(p, thrust) {
		this.rotate(p);
		this.boost(thrust);
		this.move(1.0);
		this.end();
	}

	playAngleThrust(a, t) {
		this.rotateAngle(a);
		this.boost(t);
		this.move(1.0);
		this.end();
	}

	activeShield() {
		this.shield = true;
	}

	bounceWithCheckpoint(u) {
		this.t = 100; //reset the timer
		this.checked++;
		//printErr('hit checkpoint ' + u.id);
		//need to set checkpoint to the next checkpoint here, but how?
		//console.log(`checkpoint ${u.id} bounced!`);
	}

	bounce(u) {
		if (u instanceof Checkpoint) {
			// Collision with a checkpoint
			this.bounceWithCheckpoint(u);
		} else {
			// If a pod has its shield active its mass is 10 otherwise it's 1
			var m1 = this.shield ? 10 : 1;
			var m2 = u.shield ? 10 : 1;
			var mcoeff = (m1 + m2) / (m1 * m2);

			var nx = this.x - u.x;
			var ny = this.y - u.y;

			// Square of the distance between the 2 pods. This value could be hardcoded because it is always 800²
			var nxnysquare = nx * nx + ny * ny;

			var dvx = this.vx - u.vx;
			var dvy = this.vy - u.vy;

			// fx and fy are the components of the impact vector. product is just there for optimisation purposes
			var product = nx * dvx + ny * dvy;
			var fx = (nx * product) / (nxnysquare * mcoeff);
			var fy = (ny * product) / (nxnysquare * mcoeff);

			// We apply the impact vector once
			this.vx -= fx / m1;
			this.vy -= fy / m1;
			u.vx += fx / m2;
			u.vy += fy / m2;

			// If the norm of the impact vector is less than 120, we normalize it to 120
			var impulse = Math.sqrt(fx * fx + fy * fy);
			if (impulse < 120.0) {
				fx = fx * 120.0 / impulse;
				fy = fy * 120.0 / impulse;
			}

			// We apply the impact vector a second time
			this.vx -= fx / m1;
			this.vy -= fy / m1;
			u.vx += fx / m2;
			u.vy += fy / m2;

			// This is one of the rare places where a Vector class would have made the code more readable.
			// But this place is called so often that I can't pay a performance price to make it more readable.
		}
	}
	checkpoint() {
		return new Checkpoint(this.nextCheckpointId, this.checkPointX, this.checkPointY, 500);
	}
	score() {
		return this.checked * 50000 - this.distance(this.checkpoint());
	}

	output(move) {
		var a = this.angle + move.angle;

		if (a >= 360.0) {
			a = a - 360.0;
		} else if (a < 0.0) {
			a += 360.0;
		}

		// Look for a point corresponding to the angle we want
		// Multiply by 10000.0 to limit rounding errors
		a = a * Math.PI / 180.0;
		var px = this.x + Math.cos(a) * 10000.0;
		var py = this.y + Math.sin(a) * 10000.0;

		if (move.shield) {
			print(Math.round(px), Math.round(py), "SHIELD");
			//activateShield();
		} else {
			//print(Math.round(px), Math.round(py), move.thrust, ' ' + this.angle + ' ' + ' ' + move.angle + ' ' + move.thrust );
			print(this.checkPointX, this.checkPointY, move.thrust, ' ' + Math.round(this.angle) + ' ' + ' ' + Math.round(move.angle) + ' ' + move.thrust);
		}
	}

}

class Move {
	constructor(angle, thrust) {
		this.angle = angle;
		this.thrust = thrust;
	}

	mutate(amplitude) {
		var ramin = this.angle - 36.0 * amplitude;
		var ramax = this.angle + 36.0 * amplitude;

		if (ramin < -18.0) {
			ramin = -18.0;
		}

		if (ramax > 18.0) {
			ramax = 18.0;
		}

		this.angle = ramin + Math.random() * (ramax - ramin);

		if (!this.shield && Math.random() * 100 < 0) {
			this.shield = true;
		} else {
			var pmin = this.thrust - 100 * amplitude;
			var pmax = this.thrust + 100 * amplitude;

			if (pmin < 0) {
				pmin = 0;
			}

			if (pmax > 0) {
				pmax = 100;
			}

			this.thrust = Math.floor(pmin + Math.random() * (pmax - pmin + 1));

			this.shield = false;
		}
	}
	print() {
		return `MOVE->angle: ${this.angle} thrust: ${this.thrust} shield: ${this.shield}`;
	}
}

class Solution {
	constructor(moves) {
		this.moves = moves;
	}

	setEnv(pods, checkpoints) {
		this.pods = pods;
		this.checkpoints = checkpoints;
		this.clonePods();
	}

	clonePods() {
		this.clonepods = [];
		for (var i = 0; i < this.pods.length; i++) {
			this.clonepods.push(pods[i].clone());
		}
	}

	reload() {
		this.pods = [];
		for (var i = 0; i < this.clonepods.length; i++) {
			this.pods.push(this.clonepods[i].clone());
		}
	}
	mutate(amplitude) {
		for (var i = 0; i < this.moves.length; i++) {
			this.moves[i].mutate(amplitude);
		}
	}
	score() {
		// Play out the turns
		for (var i = 0; i < this.moves.length; ++i) {
			// Apply the moves to the pods before playing
			this.pods[0].apply(this.moves[i]);
			// myPod2.apply(moves2[i]);
			this.play();
		}

		// Compute the score
		var result = this.evaluation();

		// Reset everyone to their initial states //TODO: once we add enemy pods, we need to clone their pods as well.
		this.reload();

		return result;
	}

	evaluation() {
		return this.pods[0].score(); //return pod 0's score for now.
	}

	play() {
		// This tracks the time during the turn. The goal is to reach 1.0
		var t = 0.0;

		//safety measure to prevent infinite loop
		var prevCollision = null;

		while (t < 1.0) {
			var firstCollision = null;

			// We look for all the collisions that are going to occur during the turn
			for (var i = 0; i < this.pods.length; ++i) {
				// Collision with another pod? won't occur in silver and lower leagues
				for (var j = i + 1; j < this.pods.length; ++j) {
					var col = this.pods[i].collision(pods[j]);

					// If the collision occurs earlier than the one we currently have we keep it
					if (col != null && col.t + t < 1.0 && (firstCollision == null || col.t < firstCollision.t)) {
						firstCollision = col;
					}
				}

				// Collision with another checkpoint?
				// It is unnecessary to check all checkpoints here. We only test the pod's next checkpoint.
				// We could look for the collisions of the pod with all the checkpoints, but if such a collision happens it wouldn't impact the game in any way
				var col = this.pods[i].collision(this.checkpoints[this.pods[i].nextCheckpointId]);

				// If the collision happens earlier than the current one we keep it
				if (col != null && col.t + t < 1.0 && (firstCollision == null || col.t < firstCollision.t)) {
					firstCollision = col;
				}
			}
			if (prevCollision !== null && firstCollision !== null && prevCollision.t === 0 && firstCollision.t === t &&
				prevCollision.a == firstCollision.a &&
				prevCollision.b === firstCollision.b) {
				firstCollision = null; //ignore it since we've already seen it with zero t and same two units
			}

			if (firstCollision == null) {
				// No collision, we can move the pods until the end of the turn
				for (var i = 0; i < this.pods.length; ++i) {
					this.pods[i].move(1.0 - t);
				}

				// End of the turn
				t = 1.0;
			} else {
				// Move the pods to reach the time `t` of the collision
				for (var i = 0; i < this.pods.length; ++i) {
					this.pods[i].move(firstCollision.t - t);
				}

				// Play out the collision
				firstCollision.a.bounce(firstCollision.b);

				t += firstCollision.t;
				prevCollision = firstCollision; //save a copy for safty check.
			}
		}

		for (var i = 0; i < this.pods.length; ++i) {
			this.pods[i].end();
		}
	}
}

function cloneSolution(solution) {
	var moves = [];
	for (var i = 0; i < solution.moves.length; i++) {
		var move = new Move(solution.moves[i].angle, solution.moves[i].thrust);
		moves.push(move);
	}
	return new Solution(moves);
}

function scoreSolutions(solutions) {
	scores = [];
	for (var i = 0; i < solutions.length; i++) {
		scores.push(solutions[i].score());
	}
	return scores;
}

function clonePods(podsOrig) {
	var pods = [];
	for (var i = 0; i < podsOrig.length; i++) {
		pods.push(podsOrig[i].clone());
	}
	return pods;
}

function findMinScore(scores) {
	var min = Number.MAX_VALUE;
	var index = -1;
	for (var i = 0; i < scores.length; i++) {
		var score = scores[i];
		if (score < min) {
			min = scores[i];
			index = i;
		}
	}
	return index;
}

function findMaxScore(scores) {
	var max = Number.MIN_SAFE_INTEGER;
	var index = -1;
	var aiScore = 0;
	for (var i = 0; i < scores.length; i++) {
		var score = scores[i];
		if (i === 4) aiScore = score;
		if (score > max) {
			max = score;
			index = i;
		}
	}
	//console.log('best score:' + max + ' best index: ' + index + ' aiScore: ' + aiScore);
	return index;

}

function generatePopulation(pods, checkpoints, checkpoint) {
	var solutions = [];
	for (var j = 0; j < 4; j++) {
		var moves = [];
		for (var i = 0; i < 6; i++) { //6 moves
			var move = new Move(Math.random() * 18, Math.floor(Math.random() * (100 + 1)));
			moves.push(move);
		}
		solution = new Solution(moves);
		solution.setEnv(clonePods(pods), checkpoints);
		solutions.push(solution);
	}
	//now let's generate an AI solution
	var diffAngle = pods[0].diffAngle(checkpoints);
	var moves = [];
	for (var i = 0; i < 6; i++) {
		var angle = diffAngle;
		//first figure out thrust
		var thrust = 0;
		if (Math.abs.diffAngle > 90) {
			thrust = Math.round(100 * (180 - diffAngle) / 180);
		} else {
			thrust = Math.round(100 * (180 - diffAngle) / 180);
		}
		if (diffAngle > 18) {
			angle = 18;
		} else if (diffAngle < -18) {
			angle = -18;
		} else {
			angle = diffAngle;
		}
		var move = new Move(angle, thrust);
		moves.push(move);
		//now apply the angle
		diffAngle -= angle; //turning

	}

	var solution = new Solution(moves);
	solution.setEnv(clonePods(pods), checkpoints);
	solutions.push(solution);
	return solutions;
}


// game loop
var usedBoost = false;
while (true) {
	var inputs = readline().split(' ');
	var x = parseInt(inputs[0]);
	var y = parseInt(inputs[1]);
	var nextCheckpointX = parseInt(inputs[2]); // x position of the next check point
	var nextCheckpointY = parseInt(inputs[3]); // y position of the next check point
	var nextCheckpointDist = parseInt(inputs[4]); // distance to the next checkpoint
	var nextCheckpointAngle = parseInt(inputs[5]); // angle between your pod orientation and the direction of the next checkpoint
	var inputs = readline().split(' ');
	var opponentX = parseInt(inputs[0]);
	var opponentY = parseInt(inputs[1]);


		//Now let's create some Objects
		var checkpointId = '' + nextCheckpointX + ',' + nextCheckpointY;
		var checkpoint = new Checkpoint(checkpointId, nextCheckpointX, nextCheckpointY, 500);
		var pod = new Pod('0', x, y, 400, 0, 0, 0, checkpointId, nextCheckpointX, nextCheckpointY, 0, 100, 0, false);
		pod.calculateAngle(checkpoint, nextCheckpointAngle); //this sets pod's angle since it wasn't given
		var pods = [];
		pods.push(pod);
		var checkpoints = {};
		checkpoints[checkpointId] = checkpoint;

	if (Math.abs(nextCheckpointAngle) <= 10 && nextCheckpointDist > 2000) {
			if (nextCheckpointDist > 3000 && !usedBoost) {
				usedBoost = true;
				print(nextCheckpointX, nextCheckpointY, 'BOOST', ' ' + Math.round(pod.angle) + ' BOOST');

			} else {
				print(nextCheckpointX, nextCheckpointY, 100, ' ' + Math.round(pod.angle) + ' 100');
			}
			printErr(x + ' ' + y + ' ' + nextCheckpointAngle + ' ' + pods[0].angle + ' ' + 100);
	} else {
		var solutions = generatePopulation(pods, checkpoints, checkpoint);
		var scores = scoreSolutions(solutions);

		var t0 = new Date().getTime();
		var t1 = t0;

		while ((t1 - t0) < 140) {
			var minScoreIndex = findMinScore(scores); //find new mean
			var index = Math.floor(Math.random() * (solutions.length));
			var solution = solutions[index];
			solution = cloneSolution(solution);
			solution.setEnv(clonePods(pods), checkpoints);
			solution.mutate(1.0);

			var score = solution.score();
			if (score > scores[minScoreIndex]) {
				solutions[minScoreIndex] = solution; //replace previous lowest score with this solution.
				//update scores
				scores[minScoreIndex] = score;
				//  keepSolution();
			}
			t1 = new Date().getTime();

		}

		var bestScoreIndex = findMaxScore(scores);
		printErr(x + ' ' + y + ' ' + nextCheckpointAngle + ' ' + pods[0].angle + ' ' + solutions[bestScoreIndex].moves[0].thrust);
		pod.output(solutions[bestScoreIndex].moves[0]);
	}
}