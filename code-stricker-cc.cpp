#include <iostream>
#include <stdlib.h>
#include <cmath>
#include <sys/time.h>

using namespace std;
static const double Pi = 3.14159265358979323846264338327950288419717;
static int randomBetween(int a, int b) {
    return a + rand() % (b - a + 1);
}
static unsigned long long timeNow() {
    struct timeval tv;

    gettimeofday(&tv, NULL);

    return (unsigned long long)(tv.tv_sec) * 1000 +
        (unsigned long long)((tv.tv_usec) / 1000);
}


class Point {
public:
    Point(float, float);
    float distance2(const Point*);
    float distance(const Point*);
    Point* closest(const Point*, const Point*);
    float x;
    float y;
};

class Unit : public Point {
public:
    Unit(int id, float x, float y, float radius, float vx, float vy);
    int id;
    float radius;
    float vx;
    float vy;
};

class Checkpoint : public Unit {
public:
    Checkpoint(int id, float x, float y, float radius);
};

class Collision {
public:
    Collision(Unit*, Unit*, float);
    Unit* a;
    Unit* b;
    float t;
};

class Move {
public:
    Move(float, int);
    float angle; // Between -18.0 and +18.0
    int thrust; // Between -1 and 200
    void mutate(float);
};


class Pod : public Unit {
public:
    Pod(int id, float x, float y, float radius, float vx, float vy, float angle, int nextCheckpointId);
    Pod(const Pod& pod);
    float getAngle(Point* p);
    float diffAngle(Point* p);
    void rotate(Point* p);
    void rotateAngle(float);
    void calculateAngle(Point* p, float angleToP);
    void boost(int thrust);
    void move(float t);
    void end();
    float score();
    void play(Point* p, int thrust);
    void apply(Move*);
    Checkpoint* checkpoint();
    float angle;
    int nextCheckpointId;
    int checked;
};

class Solution {

public:
    const static int numMoves = 6;

public:
    Solution(Move**, Move**, Pod**, Checkpoint**, int);
    Solution(const Solution&);
    ~Solution(); //need to release memory used by moves
    void mutate(float amplitude);
    float score();
    void load();
    Move** moves1; //stores an array of array of Move* --this is getting ugly
    Move** moves2;
    Pod** pods; //hold a pointer to the cloned pod.
    Pod** origPods; //hold a pointer to the original pod
    Checkpoint** checkpoints; //point to an array of checkpoint pointers, need not be released or cloned
    int numCheckpoints;
 };

class Game
{
public:
    Game();
    ~Game();

    //bool applyNextMove(Move*);
    Move** calcNextMove();
    float* scoreSolutions(Solution**);
    int findMinScore(float*);
    int findMaxScore(float*);
    Solution** generatePopulation();
    int findLongestCheckpoint();
    void output(Move**);
    
    int numCheckpoints = 0;
    Pod ** pods = 0;
    Pod ** enemyPods = 0;
    Checkpoint **checkpoints = 0;
};

Point::Point(float x, float y) {
    this->x = x;
    this->y = y;
}

float Point::distance2(const Point* p) {
    return ::pow((p->x - this->x), 2) + ::pow((p->y - this->y), 2);
}

float Point::distance(const Point* p) {
    return sqrt(distance2(p));
}

Point* Point::closest(const Point* a, const Point* b) {
        float da = b->y - a->y;
        float db = a->x - b->x;
        float c1 = da*a->x + db*a->y;
        float c2 = -db*x + da*y;
        float det = da*da + db*db;
        float cx = 0;
        float cy = 0;

        if (det != 0) {
            cx = (da*c1 - db*c2) / det;
            cy = (da*c2 + db*c1) / det;
        } else {
            // The point is already on the line
            cx = this->x;
            cy = this->y;
        }

        return new Point(cx, cy);
}

Unit::Unit(int id, float x, float y, float radius, float vx, float vy)
   : Point(x, y), id(id), radius(radius), vx(vx), vy(vy)
{

}

Collision::Collision(Unit* a, Unit* b, float t)
   : a(a), b(b), t(t)
{

}

Checkpoint::Checkpoint(int id, float x, float y, float radius)
    : Unit(id, x, y, radius, 0, 0)
{

}

Pod::Pod(int id, float x, float y, float radius, float vx, float vy, float angle, int nextCheckpointId)
    : Unit(id, x, y, radius, vx, vy), angle(angle), nextCheckpointId(nextCheckpointId), checked(0)
{
}

Pod::Pod(const Pod& pod)
    : Unit(pod.id, pod.x, pod.y, pod.radius, pod.vx, pod.vy), angle(pod.angle),
      nextCheckpointId(pod.nextCheckpointId), checked(pod.checked) {
}

void Pod::apply(Move* move) {
    rotateAngle(move->angle);
    boost(move->thrust);
}

float Pod::getAngle(Point* p) {
    float d = this->distance(p);
    if (d == 0) return 0;
    float dx = (p->x - this->x) / d;
    float dy = (p->y - this->y) / d;

    // Simple trigonometry. We multiply by 180.0 / PI to convert radiants to degrees.
    float a = acos(dx) * 180.0 / Pi;

    // If the point I want is below me, I have to shift the angle for it to be correct
    if (dy < 0) {
        a = 360.0 - a;
    }

    return a;
}

float Pod::diffAngle(Point* p) {
    float a = this->getAngle(p);

    // To know whether we should turn clockwise or not we look at the two ways and keep the smallest
    // The ternary operators replace the use of a modulo operator which would be slower
    float right = this->angle <= a ? a - this->angle : 360.0 - this->angle + a;
    float left = this->angle >= a ? this->angle - a : this->angle + 360.0 - a;

    if (right < left) {
        return right;
    } else {
        // We return a negative angle if we must rotate to left
        return -left;
    }
}

void Pod::calculateAngle(Point* p, float angleToP) {
		float a = this->getAngle(p);
		float b = 0.0;
		//turning right (positive) or turning left (negative)
		if (angleToP >= 0) {
			b = a > angleToP ? (a - angleToP) : 360 + a - angleToP;
		} else { //turning left
			b = (a - angleToP);
		}
		if (b >= 360) b -= 360;
		this->angle = b;
}

void Pod::rotate(Point* p) {
    float a = this->diffAngle(p);

    this->rotateAngle(a);
}

void Pod::rotateAngle(float a) {
    // Can't turn by more than 18° in one turn
    if (a > 18.0) {
        a = 18.0;
    } else if (a < -18.0) {
        a = -18.0;
    }

    this->angle += a;

    // The % operator is slow. If we can avoid it, it's better.
    if (this->angle >= 360.0) {
        this->angle = this->angle - 360.0;
    } else if (this->angle < 0.0) {
        this->angle += 360.0;
    }
}

void Pod::boost(int thrust) {
  // Don't forget that a pod which has activated its shield cannot accelerate for 3 turns
    /*if (this.shield) {
        return;
    }*/

    // Conversion of the angle to radiants
    float ra = this->angle * Pi / 180.0;

    // Trigonometry, adding to the existing vx and vy is important to model the turning force
    this->vx += cos(ra) * thrust;
    this->vy += sin(ra) * thrust;
}

void Pod::move(float t) {
    this->x += this->vx * t;
    this->y += this->vy * t;
}

void Pod::end() {
    this->x = ::round(this->x);
    this->y = ::round(this->y);
    this->vx = ::trunc(this->vx * 0.85);
    this->vy = ::trunc(this->vy * 0.85);

    // Don't forget that the timeout goes down by 1 each turn. It is reset to 100 when you pass a checkpoint
    //this.timeout -= 1;
}

void Pod::play(Point* p, int thrust) {
    this->rotate(p);
    this->boost(thrust);
    this->move(1.0);
    this->end();
}

Checkpoint* Pod::checkpoint() {
    return nullptr;  //TODO: need to implement this later.
}

float Pod::score() {
    return this->checked*50000 - this->distance(this->checkpoint()); //need to figure out if the checkpoint is a goal checkpoint
}

Move::Move(float angle, int thrust)
    : angle(angle), thrust(thrust) {

}

void Move::mutate(float amplitude) {
    float ramin = this->angle - 36.0 * amplitude;
    float ramax = this->angle + 36.0 * amplitude;

    if (ramin < -18.0) {
        ramin = -18.0;
    }

    if (ramax > 18.0) {
        ramax = 18.0;
    }

    this->angle = randomBetween(ramin, ramax);


    int pmin = this->thrust - 100 * amplitude;
    int pmax = this->thrust + 100 * amplitude;

    if (pmin < 0) {
        pmin = 0;
    }

    if (pmax > 100) {
        pmax = 100;
    }

    this->thrust = randomBetween(pmin, pmax);

    //this.shield = false;

}

Solution::Solution(Move** moves1, Move** moves2, Pod** myPods, Checkpoint** checkpoints, int numCheckpoints)
    :moves1(moves1), moves2(moves2), checkpoints(checkpoints), numCheckpoints(numCheckpoints) {
    origPods = new Pod*[2];
    pods = new Pod*[2];
    for (int i=0; i<2; i++) {
        this->origPods[i] = new Pod(*(myPods[i])); //original Pod, whill not change
        pods[i] = new Pod(*(myPods[i]));
    }
    this->checkpoints = checkpoints; //no need to clone here as we don't worry about memory allocation for checkpoints, the game loop will release them.
    this->numCheckpoints = numCheckpoints;
}

Solution::Solution(const Solution& solution) {

    this->pods = new Pod*[2];
    this->origPods = new Pod*[2];
    for (int i=0; i<2; i++) {
        this->origPods[i] = new Pod(*(solution.pods[i]));
        this->pods[i] = new Pod(*(solution.pods[i]));
    }
    moves1 = new Move*[Solution::numMoves];  //only store moves for my pods for now
    moves2 = new Move*[Solution::numMoves];  //only store moves for my pods for now
    for (int i=0; i<Solution::numMoves; i++) {
        moves1[i] = new Move(*solution.moves1[i]);
        moves2[i] = new Move(*solution.moves2[i]);
    }

    this->checkpoints = solution.checkpoints;
    this->numCheckpoints = solution.numCheckpoints;
}

Solution::~Solution() {

    for (int i=0; i<Solution::numMoves; i++) {
        delete moves1[i];
        delete moves2[i];
    }
    delete [] moves1;
    delete [] moves2;
    for (int i=0; i<2; i++) {
        delete pods[i];
        delete origPods[i];
    }
    delete[] pods;
    delete[] origPods;
}

void Solution::mutate(float amplitude) {
    for (int i = 0; i < Solution::numMoves; i++) {
        this->moves1[i]->mutate(amplitude);
        this->moves2[i]->mutate(amplitude);
    }
}

void Solution::load() {
    for (int i=0; i<2; i++) {
        delete pods[i];
        pods[i] = new Pod(*origPods[i]);
    }
}

float Solution::score() {
    // Play out the turns
    float scores[2] = {0.0, 0.0};
    for (int i = 0; i < Solution::numMoves; ++i) {
        // Apply the moves to the pods before playing

        //for now play means just move there, in the future we need consider collisions
        //play();
         for (int j=0; j<2; j++) {
             if (j==0) {
                pods[j]->apply(moves1[i]);
             } else {
                pods[j]->apply(moves2[i]);
             }
             pods[j]->move(1.0);
             pods[j]->end(); //end the turn

             Checkpoint* currentCheckpoint = this->checkpoints[pods[j]->nextCheckpointId];

             //first check if we've already reached the current checkpoint
             float d = pods[j]->distance2(currentCheckpoint);
             if (d < ((pods[j]->radius -100) * (pods[j]->radius -100))) {
                 /* if (currentCheckpoint->id == 0) { //id 0 always indicate the start of a lap
                lapped = true;
            }

            qDebug("Collision with");
            qDebug() << (myPod->nextCheckpointId) << d << myPod->x << myPod->y
                     << currentCheckpoint->x << currentCheckpoint->y; */
                 pods[j]->nextCheckpointId = (pods[j]->nextCheckpointId+1) % this->numCheckpoints;
                 //update score to indicate big hit!
                 scores[j] += 50000; //may need to lower the weight if the next few moves are not optimized.
             } else {
                 scores[j] -= sqrt(d); //the further, the lower the score
             }
         }
    }

    // Compute the score
    //float result = evaluation();

    // Reset everyone to their initial states
    load();

    return scores[0] + scores[1];
}


Game::Game()
{
}

Game::~Game()
{
    for (int i=0; i<2; i++) {
        if (pods[i])
        delete this->pods[i];
        if (enemyPods[i])
        delete this->enemyPods[i];
    }
    delete [] pods;
    delete [] enemyPods;

    for (int i=0; i<this->numCheckpoints; i++) {
          if (checkpoints[i])
          delete checkpoints[i];
    }
    delete [] checkpoints;
}

float* Game::scoreSolutions(Solution** solutions) {
    float* scores = new float[5];
    for (int i=0; i<5; i++) {
        scores[i] = solutions[i]->score();
    }
    return scores;
}

int Game::findMinScore(float* scores) {
    float minScore = INFINITY;
    int minIndex = -1;
    for (int i=0; i<5; i++) {
        if (scores[i] < minScore) {
            minIndex = i;
            minScore = scores[i];
        }
    }
    return minIndex;

}

int Game::findMaxScore(float* scores) {
    float maxScore = -1 * INFINITY;
    int maxIndex = -1;
    for (int i=0; i<5; i++) {
        if (scores[i] > maxScore) {
            maxIndex = i;
            maxScore = scores[i];
        }
    }
    return maxIndex;
}

//Generate next move using AI
Move** Game::calcNextMove() {
   Move** bestMoves = new Move*[2]; //to be released in the run loop.
   //qDebug() << "allocating move**";

   Solution** solutions = generatePopulation();
   float* scores= scoreSolutions(solutions);

   /*qDebug("Scores:");
   for (int i=0; i<5; i++) {
       qDebug() << scores[i];
   }*/
   float amplitude = 1.0;

   unsigned long long t0 = timeNow();
   unsigned long long t1 = t0;
   unsigned int sum = 0;

   while (t1-t0 < 140) {
       /*
       if (abort) {
           qDebug("abort called");
           for (int i=0; i<5; i++) {
               //qDebug() << "deleting Solution*";
               delete solutions[i];
           }
           delete [] solutions;
           delete [] scores;
           delete [] bestMoves;
            return nullptr;
       }*/
    sum++;
    int minScoreIndex = findMinScore(scores);
    int index = randomBetween(0, 4);
    Solution* solution = solutions[index];
    Solution* newSolution = new Solution(*solution);
    //qDebug() << "allocating Solution*";
    newSolution->mutate(amplitude);

    float score = newSolution->score();
    if (score > scores[minScoreIndex]) {
       // qDebug() << "deleting Solution*";
        delete solutions[minScoreIndex];
        solutions[minScoreIndex] = newSolution;
        scores[minScoreIndex] = score;
    } else {
        //qDebug() << "deleting Solution*";
        delete newSolution; //not good, throw away
    }
    t1 = timeNow();
   }

   int maxScoreIndex = findMaxScore(scores);
   Solution* bestSolution = solutions[maxScoreIndex];

   bestMoves[0] = new Move(bestSolution->moves1[0]->angle, bestSolution->moves1[0]->thrust); //take the first move.
   bestMoves[1] = new Move(bestSolution->moves2[0]->angle, bestSolution->moves2[0]->thrust); //take the first move.

   for (int i=0; i<5; i++) {
       //qDebug() << "deleting Solution*";
       delete solutions[i];
   }
   delete [] solutions;
   delete [] scores;

  // qDebug() << sum << " iterations";
   return bestMoves;
}

/*
bool Game::applyNextMove(Move* move)
{
    bool lapped = false;
    Checkpoint* currentCheckpoint = this->checkpoints[this->myPod->nextCheckpointId];

    //first check if we've already reached the current checkpoint
    float d = myPod->distance(currentCheckpoint);
    if (d < (myPod->radius)) {
        if (currentCheckpoint->id == 0) { //id 0 always indicate the start of a lap
            lapped = true;
        }

       // qDebug("Collision with");
       // qDebug() << (myPod->nextCheckpointId) << d << myPod->x << myPod->y
       //          << currentCheckpoint->x << currentCheckpoint->y;
        myPod->nextCheckpointId = (myPod->nextCheckpointId+1) % numCheckpoints;
        currentCheckpoint = this->checkpoints[myPod->nextCheckpointId];
    }

    myPod->rotateAngle(move->angle);
    myPod->boost(move->thrust);
    myPod->move(1.0);
    myPod->end();
    //qDebug() << myPod->x << myPod->y;
    //qDebug() << angle << thrust;
    //this->msleep(150); //sleep for 150 ms
    return lapped;
}
*/


Solution** Game::generatePopulation() {
    Solution ** solutions = new Solution*[5]; //five solutions
    for (int j=0; j<4; j++) { //4 random solutions

            Move** moves1 = new Move*[Solution::numMoves];
            Move** moves2 = new Move*[Solution::numMoves];
            for (int i = 0; i < Solution::numMoves; i++) { //6 moves
                moves1[i] = new Move(randomBetween(-18, 18), randomBetween(0, 100));  //we may ignore the angle
                moves2[i] = new Move(randomBetween(-18, 18), randomBetween(0, 100));  //we may ignore the angle
            }

        Solution* solution = new Solution(moves1, moves2, pods, checkpoints, numCheckpoints);
        solutions[j] = solution;
    }

    Move** moves1 = new Move*[Solution::numMoves];
    Move** moves2 = new Move*[Solution::numMoves];
    for (int k=0; k<2; k++) {
        //now let's generate an AI solution
        float diffAngle = pods[k]->diffAngle(checkpoints[pods[k]->nextCheckpointId]);

        for (int i = 0; i < Solution::numMoves; i++) {

            float angle = diffAngle;
            //first figure out thrust
            int thrust = 0;
            if (std::abs(diffAngle) > 90) {
                thrust = round(100 * (180 - std::abs(diffAngle)) / 180);
            } else {
                thrust = round(100 * (180 - std::abs(diffAngle)) / 180);
            }
            if (thrust > 100) thrust = 100;
            if (diffAngle > 18) {
                angle = 18;
            } else if (diffAngle < -18) {
                angle = -18;
            } else {
                angle = diffAngle;
            }
            if (k==0) {
                moves1[i] = new Move(angle, thrust);
            } else {
                moves2[i] = new Move(angle, thrust);
            }
            //now apply the angle
            diffAngle -= angle; //turning
        }
    }
    Solution* solution = new Solution(moves1, moves2, pods, checkpoints, numCheckpoints);

    solutions[4] = solution;
    return solutions;
}


void Game::output(Move** moves) {
    for (int i=0; i<2; i++) {
    float a = pods[i]->angle + moves[i]->angle;

    if (a >= 360.0) {
        a = a - 360.0;
    } else if (a < 0.0) {
        a += 360.0;
    }

    // Look for a point corresponding to the angle we want
    // Multiply by 10000.0 to limit rounding errors
    a = a * Pi / 180.0;
    float px = pods[i]->x + cos(a) * 10000.0;
    float py = pods[i]->y + sin(a) * 10000.0;

    //if (move.shield) {
    //    print(round(px), round(py), "SHIELD");
    //    activateShield();
    //} else {
    cout << round(px) << " " <<  round(py) << " " << moves[i]->thrust << endl;
    }
   // }
}

int Game::findLongestCheckpoint() {
    long longest = 0;
    int index = -1;
    for (int i=0; i<this->numCheckpoints; i++) {
        long d = checkpoints[i]->distance2(checkpoints[i%numCheckpoints]);
        if (d > longest) {
            longest = d;
            index = i;
        }
    }
    return index;
}


int main()
{
    srand (time(NULL));
    int laps;
    cin >> laps; cin.ignore();
    int checkpointCount;
    cin >> checkpointCount; cin.ignore();
    Checkpoint** checkpoints = new Checkpoint*[checkpointCount]; //up to 7 checkpoints
    Pod** myPods = new Pod*[2];
    for (int i=0; i<2; i++) {
        myPods[i] = new Pod(i, 0, 0, 400, 0, 0, 0, 0);
    }
    Pod** enemyPods = new Pod*[2];
    for (int i=0; i<2; i++) {
        enemyPods[i] = new Pod(i, 0, 0, 400, 0, 0, 0, 0);
    }
    for (int i = 0; i < checkpointCount; i++) {
        int checkpointX;
        int checkpointY;
        cin >> checkpointX >> checkpointY; cin.ignore();
        Checkpoint* c = new Checkpoint(i, checkpointX, checkpointY, 600);
        checkpoints[i] = c;
    }
    Game theGame;
    theGame.pods = myPods;
    theGame.enemyPods = enemyPods;
    theGame.checkpoints = checkpoints;
    theGame.numCheckpoints = checkpointCount;
    int longestCheckpointStart = theGame.findLongestCheckpoint(); //this will find the longest distance
    bool usedBoost1 = false;
    bool usedBoost2 = false;

    // game loop
    while (1) {
        for (int i = 0; i < 2; i++) {
            int x; // x position of your pod
            int y; // y position of your pod
            int vx; // x speed of your pod
            int vy; // y speed of your pod
            int angle; // angle of your pod
            int nextCheckPointId; // next check point id of your pod
            cin >> x >> y >> vx >> vy >> angle >> nextCheckPointId; cin.ignore();
            myPods[i]->x = x, myPods[i]->y = y; myPods[i]->nextCheckpointId = nextCheckPointId;
            myPods[i]->vx = vx; myPods[i]->angle = angle;
            
        }
        for (int i = 0; i < 2; i++) {
            int x2; // x position of the opponent's pod
            int y2; // y position of the opponent's pod
            int vx2; // x speed of the opponent's pod
            int vy2; // y speed of the opponent's pod
            int angle2; // angle of the opponent's pod
            int nextCheckPointId2; // next check point id of the opponent's pod
            cin >> x2 >> y2 >> vx2 >> vy2 >> angle2 >> nextCheckPointId2; cin.ignore();
            enemyPods[i]->x = x2, enemyPods[i]->y = y2; enemyPods[i]->nextCheckpointId = nextCheckPointId2;
            enemyPods[i]->vx = vx2; enemyPods[i]->vy = vy2; enemyPods[i]->angle = angle2;
        }

        Move** moves = theGame.calcNextMove(); //TODO: this will need to return 2 moves.
        /*if (!usedBoost && laps > 1 && currentCheckpointId-1 == longestCheckpointStart && std::abs(nextCheckpointAngle) < 20) {
            usedBoost = true;
            cout << nextCheckpointX << " " << nextCheckpointY << " BOOST" << endl;
        } else { */
            theGame.output(moves);
       /* }*/

       // cerr << "vx: " << myPod->vx << " vy: " << myPod->vy << " angle: " << myPod->angle << " diffAngle " << nextCheckpointAngle << endl; 
        //cout << nextCheckpointX << " " << nextCheckpointY << " " << thrust << " vx: " << myPod->vx << " vy: " << myPod->vy << " angle: " << myPod->angle << endl;
        for (int i=0; i<2; i++) {
            delete moves[i];
        }

        delete [] moves;
    }
}