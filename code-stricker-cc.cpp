#include <iostream>
#include <stdlib.h>
#include <cmath>
#include <sys/time.h>
#include <array>
#include <random>
//#include <chrono>
#include <functional>
#include <vector>

using namespace std;
//using namespace std::this_thread;     // sleep_for, sleep_until
//using namespace std::literals::chrono_literals; // ns, us, ms, s, h, etc.
//using namespace std::chrono;

std::random_device rd;
std::mt19937 gen(rd());
std::uniform_real_distribution<> dis(0, 1);
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


template <class T, unsigned I, unsigned J>
using Matrix = std::array<std::array<T, J>, I>;

template <class T, unsigned I>
using List = std::array<T, I>;

class Point {
public:
    Point(float, float);
    float distance2(const Point*);
    float distance(const Point*);
    Point* closest(const Point*, const Point*);
    float x;
    float y;
};

class Collision;

class Unit : public Point {
public:
    Unit(int id, float x, float y, float radius, float vx, float vy);
    virtual ~Unit();
    Collision* collision(Unit* u);
    virtual void bounce(Unit*) = 0;
    int id;
    float radius;
    float vx;
    float vy;
};

class Checkpoint : public Unit {
public:
    Checkpoint(int id, float x, float y, float radius);
    Checkpoint();
    void bounce(Unit*) override; //do nothng here.
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
    Move();
    Move(float, int);
    float angle; // Between -18.0 and +18.0
    int thrust; // Between 0 and 200
    void mutate(float);
};

//Holds a list of moves

class Pod : public Unit {
public:
    Pod(int id, float x, float y, float radius, float vx, float vy, float angle, int nextCheckpointId);
    Pod(const Pod&);
    Pod();
    float getAngle(Point* p);
    float diffAngle(Point* p);
    void rotate(Point* p);
    void rotateAngle(float);
    void boost(int thrust);
    void move(float t);
    void end();
    void play(Point* p, int thrust);
    void apply(Move*);
    void bounce(Unit* u) override;
    float angle;
    int nextCheckpointId;
    int checked;
    int timeout;
    int shield; //0: no shield, 1-3 shield with cooldown going down each turn.
    bool usedBoost;
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
Unit::~Unit() {

}

Collision::Collision(Unit* a, Unit* b, float t)
   : a(a), b(b), t(t)
{
}

Collision* Unit::collision(Unit* u) {
    // Square of the distance
    float dist = this->distance2(u);

    // Sum of the radii squared
    float sr = (this->radius + u->radius)*(this->radius + u->radius);

    // We take everything squared to avoid calling sqrt uselessly. It is better for performances

    if (dist < sr) {
        // Objects are already touching each other. We have an immediate collision.
        return new Collision(this, u, 0.0);
    }

    // Optimisation. Objects with the same speed will never collide
    if (this->vx == u->vx && this->vy == u->vy) {
        return nullptr;
    }

    // We place ourselves in the reference frame of u. u is therefore stationary and is at (0,0)
    float x = this->x - u->x;
    float y = this->y - u->y;
    Point myp(x, y);
    float vx = this->vx - u->vx;
    float vy = this->vy - u->vy;
    Point up(0, 0);

    // We look for the closest point to u (which is in (0,0)) on the line described by our speed vector
    Point b(x + vx, y + vy);
    Point* p = up.closest(&myp, &b);

    // Square of the distance between u and the closest point to u on the line described by our speed vector
    float pdist = up.distance2(p);

    // Square of the distance between us and that point
    float mypdist = myp.distance2(p);

    // If the distance between u and this line is less than the sum of the radii, there might be a collision
    if (pdist < sr) {
     // Our speed on the line
        float length = sqrt(vx*vx + vy*vy);

        // We move along the line to find the point of impact
        float backdist = sqrt(sr - pdist);
        p->x = p->x - backdist * (vx / length);
        p->y = p->y - backdist * (vy / length);

        // If the point is now further away it means we are not going the right way, therefore the collision won't happen
        if (myp.distance2(p) > mypdist) {
            delete p;
            return nullptr;
        }

        pdist = p->distance(&myp);

        // The point of impact is further than what we can travel in one turn
        if (pdist > length) {
            delete p;
            return nullptr;
        }

        // Time needed to reach the impact point
        float t = pdist / length;
        delete p;

        return new Collision(this, u, t);
    }

    delete p;

    return nullptr;
}

Checkpoint::Checkpoint(int id, float x, float y, float radius)
    : Unit(id, x, y, radius, 0, 0)
{

}
Checkpoint::Checkpoint()
    : Unit(0, 0, 0, 600, 0, 0) {

}

void Checkpoint::bounce(Unit*) {
    //do nothing here;
}

Pod::Pod()
    : Unit(0, 0, 0, 400, 0, 0), angle(0), nextCheckpointId(0), checked(0), timeout(100), shield(0), usedBoost(false) {

}

Pod::Pod(int id, float x, float y, float radius, float vx, float vy, float angle, int nextCheckpointId)
    : Unit(id, x, y, radius, vx, vy), angle(angle), nextCheckpointId(nextCheckpointId), checked(0), timeout(100), shield(0),
      usedBoost(false)
{

}


Pod::Pod(const Pod& pod)
    : Unit(pod.id, pod.x, pod.y, pod.radius, pod.vx, pod.vy), angle(pod.angle),
      nextCheckpointId(pod.nextCheckpointId), checked(pod.checked), timeout(pod.timeout), shield(pod.shield),
      usedBoost(false) {
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
    if (this->shield) {
        this->shield--;
        return;
    }

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
    this->timeout -= 1;
}

void Pod::play(Point* p, int thrust) {
    this->rotate(p);
    this->boost(thrust);
    this->move(1.0);
    this->end();
}

void Pod::bounce(Unit* u) {

    // If a pod has its shield active its mass is 10 otherwise it's 1
    float m1 = this->shield ? 10 : 1;
    float m2 = ((Pod*)u)->shield ? 10 : 1;   //for enemy pods, we always get back zero since we don't know.
    float mcoeff = (m1 + m2) / (m1 * m2);

    float nx = this->x - u->x;
    float ny = this->y - u->y;

    // Square of the distance between the 2 pods. This value could be hardcoded because it is always 800²
    float nxnysquare = nx*nx + ny*ny;

    float dvx = this->vx - u->vx;
    float dvy = this->vy - u->vy;

    // fx and fy are the components of the impact vector. product is just there for optimisation purposes
    float product = nx*dvx + ny*dvy;
    float fx = (nx * product) / (nxnysquare * mcoeff);
    float fy = (ny * product) / (nxnysquare * mcoeff);

    // We apply the impact vector once
    this->vx -= fx / m1;
    this->vy -= fy / m1;
    u->vx += fx / m2;
    u->vy += fy / m2;

    // If the norm of the impact vector is less than 120, we normalize it to 120
    float impulse = sqrt(fx*fx + fy*fy);
    if (impulse != 0 && impulse < 120.0) {
        fx = fx * 120.0 / impulse;
        fy = fy * 120.0 / impulse;
    }

    // We apply the impact vector a second time
    this->vx -= fx / m1;
    this->vy -= fy / m1;
    u->vx += fx / m2;
    u->vy += fy / m2;

    // This is one of the rare places where a Vector class would have made the code more readable.
    // But this place is called so often that I can't pay a performance price to make it more readable.

}


Move::Move()
    : angle(0), thrust(-2) {

}

Move::Move(float angle, int thrust)
    : angle(angle), thrust(thrust) {

}

template <typename T>
struct solution {
    std::vector<T> chromosomes;
    int age;
    double fitnessResult;
    bool killed;
};

template <typename T>
class PhenoType {
public:
    virtual std::vector<T> generate() = 0;
    virtual std::vector<T> mutate(std::vector<T> solution) = 0;
    virtual std::vector<T> crossover(std::vector<T> parentA, std::vector<T> parentB) = 0;
    virtual double fitness (std::vector<T> solution) = 0;
};

template <typename T>
class Population {
public:
    static const int tournamentSize = 2;
public:
    Population(
            int populationSize,
            int maxAge,
            PhenoType<T>* phenoType);

    void seedSolution(std::vector<T> seed);
    std::vector<solution<T>> getSolutions() ;
    solution<T> getFittest(const std::vector<solution<T>>& solutions);
    // Select individuals for crossover
    solution<T> tournamentSelection();
    solution<T> rouletteSelection();
    int getKilledAmount();
    void generate();
    bool mutate();
    bool crossover();
    double doFitness();

private:
    int PopulationSize = 0;
    int MaxAge = 0;
    double totalFitness = 0.0;
    std::vector<solution<T>> Solutions = {};
    PhenoType<T>* phenoType = 0;
};


template <typename T>
Population<T>::Population(
        int populationSize,
        int maxAge,
        PhenoType<T>* phenoType) {
    PopulationSize = populationSize;
    MaxAge = maxAge;
    this->phenoType = phenoType;
    std::vector<solution<T>> solutions(PopulationSize);
    Solutions = solutions;
}

template <typename T>
void Population<T>::seedSolution(std::vector<T> seed) {
    Solutions[0].chromosomes = seed;
}

template <typename T>
std::vector<solution<T>> Population<T>::getSolutions() {
    return Solutions;
}

template <typename T>
solution<T> Population<T>::getFittest(const std::vector<solution<T>>& solutions) {
    double best = solutions[0].fitnessResult;
    int bestIndex = 0;

    int i = 0;
    for (solution<T> s : solutions) {
        if (best < s.fitnessResult) {
            best = s.fitnessResult;
            bestIndex = i;
        }
        i++;
    }
    return solutions[bestIndex];
}

// Select individuals for crossover
template <typename T>
solution<T> Population<T>::tournamentSelection() {
    // Create a tournament population
    solution<T> best;
    best.fitnessResult = -1 * INFINITY;

    for (int i = 0; i < tournamentSize; i++) {
        int randomId = rand() % PopulationSize;

        if (Solutions[randomId].fitnessResult > best.fitnessResult) {
            best = Solutions[randomId];
        }
    }
    return best;
}

template <typename T>
solution<T> Population<T>::rouletteSelection() {
    long s = trunc(totalFitness);
    long r = rand() % (s+1);
    int i = 0;
    while (r > 0) {
        r -= Solutions[i++].fitneessResult;
    }
    return Solutions[i-1];
}

template <typename T>
int Population<T>::getKilledAmount() {
    int result = 0;
    for (solution<T> s : Solutions) {
        if (s.killed) {
            result++;
        }
    }
    return result;
}

template <typename T>
void Population<T>::generate() {
    for (int i=0; i < PopulationSize; i++) {
        solution<T> s;
        s.chromosomes = phenoType->generate();
        s.age = 0;
        s.killed = false;
        Solutions[i] = s;
        //Solutions.push_back(s);
    }
}

template <typename T>
bool Population<T>::mutate() {
    for (std::size_t i = 1; i < Solutions.size(); i++) {
        Solutions[i].chromosomes = phenoType->mutate(Solutions[i].chromosomes);
        Solutions[i].age++;
    }
    return true;
}

template <typename T>
bool Population<T>::crossover() {
     std::vector<solution<T>> NewSolutions(PopulationSize);
     NewSolutions[0] = getFittest(Solutions); //elitism

     for (int i=1; i<PopulationSize; i++) {
         solution<T> dad = tournamentSelection();
         solution<T> mom = tournamentSelection();
         //solution<T> dad = rouletteSelection();
         //solution<T> mom = rouletteSelection();
         std::vector<T> chromosomes = phenoType->crossover(dad.chromosomes, mom.chromosomes);
         solution<T> child;
         child.chromosomes = chromosomes;
         child.age = 0;
         child.killed = false;
         NewSolutions[i] = child;
     }
     Solutions = NewSolutions;
     return true;
 }

template <typename T>
double Population<T>::doFitness() {
    double fitnessResult;
    totalFitness = 0.0; //initialize
    for (std::size_t i = 0; i < Solutions.size(); i++) {
        fitnessResult = phenoType->fitness(Solutions[i].chromosomes);
        Solutions[i].fitnessResult = fitnessResult;
        totalFitness += fitnessResult;

        /*if (Decide(fitnessResult)) {
            Solutions[i].killed = true;
        } else if (Solutions[i].age > MaxAge) {
            Solutions[i].killed = true;
        }*/
    }
    return 0.0;
}



class Game: public PhenoType<float>
{
public:
    static const int chromosomeSize = 24; //2 x 12 for two pods
    static const int mutationRate = 5;
    static const int populationSize = 40;

public:
    Game();
    ~Game();

    void startGame();
    void reload() { pods = origPods; }
    bool applyNextMove(List<Move, 2>);
    List<Move, 2> calcNextMove();
    void generateNewSetting();
    void play();
    std::vector<float> decode(std::vector<float> input);
    float encode(int num, float gen);
    std::vector<float> generate() override;
    std::vector<float> generateAIMoves();
    std::vector<float> mutate(std::vector<float> solution) override;
    std::vector<float> crossover(std::vector<float> parentA, std::vector<float> parentB) override;
    double fitness (std::vector<float> solution) override;
    bool decideToKill(double fit);
    void output(const List<Move, 2> & moves);

public:
    List<Pod, 4> pods;
    List<Pod, 4> origPods;
    List<Checkpoint, 8> checkpoints;
    int numCheckpoints = 0;
};


Game::Game()
{
}

Game::~Game()
{
}
std::vector<float> Game::decode(std::vector<float> input) {
    std::vector<float> result(Game::chromosomeSize);
    for (std::size_t i=0; i<input.size(); i++) {
        if (i % 2 == 0) {
            //angle
           if (input[i] < 0.25) {
               result[i] = -18.0;
           } else if (input[i] > 0.75) {
               result[i] = 18.0;
           } else {
               result[i] = -18 + 36 * ((input[i] - 0.25) * 2.0);
           }
        } else if (i % 2 == 1) {
            if(input[i] < 0.25) {
                result[i] = 0;
            } else if(input[i] > 0.75) {
                result[i] = 100;
            } else {
                result[i] = 100 * ((input[i] - 0.25) * 2.0);
            }
        }
    }
    return result;
}

//num is either 0 for angle, or 1 for thrust
float Game::encode(int num, float gen) { //angle
    if (num == 0) {
        return (gen + 18) /72 + 0.25;
    } else {
        return (gen/100) /2 + 0.25;
    }
}



std::vector<float> Game::generate() {
    std::vector<float> result(Game::chromosomeSize);
    for(int i = 0; i < Game::chromosomeSize; i++) {
        //result.push_back(dis(gen));
        result[i] = dis(gen);
    }
    return result;
}

std::vector<float> Game::generateAIMoves() {
    std::vector<float> result(Game::chromosomeSize);
    for (int j=0; j<2; j++) {
        float diffAngle = pods[j].diffAngle(&checkpoints[pods[j].nextCheckpointId]);

        for (int i = 0; i < Game::chromosomeSize/4; i++) {

            float angle = diffAngle;
            //first figure out thrust
            int thrust = 0;
            if (std::abs(diffAngle) > 90) {
                thrust = round(100 * (180 - std::abs(diffAngle)) / 180);
            } else {
                thrust = round(100 * (180 - std::abs(diffAngle)) / 180);
            }
            if (thrust > 100) thrust = 100;
            //thrust = 50;

            /*if (!(pods[k].usedBoost) && std::abs(diffAngle) < 20 && i==0 && this->distanceToCheckpoint[k] > 9000000) { //only the first move
            thrust = 650; //one time boost
            //pods[k].usedBoost = true;
        }*/
            if (diffAngle > 18) {
                angle = 18;
            } else if (diffAngle < -18) {
                angle = -18;
            } else {
                angle = diffAngle;
            }
            result[2*i + j*12] = encode(0, angle);
            result[2*i + j*12 + 1] = encode(1, thrust);

            //now apply the angle
            diffAngle -= angle; //turning
        }
    }
    return result;
}



std::vector<float> Game::mutate(std::vector<float> solution) {
    for(std::size_t i = 1; i < solution.size(); i++) {  //don't mutate the elite
        if (rand() % 100 <= Game::mutationRate) {    //1% mutation rate
            solution[i] = dis(gen);  //new random float
        }
    }
    return solution;
}
std::vector<float> Game::crossover(std::vector<float> parentA, std::vector<float> parentB) {
    std::vector<float> child(Game::chromosomeSize); //reserve space
   // std::cout << "parentA size: " << parentA.size() << " parentB size: " << parentB.size() << std::endl;
    for(std::size_t i = 0; i < parentA.size(); i++) {
        if (rand() % 2 == 1) {      //randomly cross-over between two parents
            child[i] = parentA[i];
        } else {
            child[i] = parentB[i];
        }
    }
    return child;
}


double Game::fitness (std::vector<float> solution) {
    std::vector<float> moves = decode(solution);  //convert from 0-1 numbers to moves

    // Play out the turns
    float score = 0.0;
    for (std::size_t i = 0; i < moves.size()/4; i++) {
        // Apply the moves to the pods before playing
        for (int j=0; j<2; j++) {
            Move m(moves[2*i + j*12], moves[2*i+1+12*j]);
            pods[j].apply(&m);

            //Need to apply enemy pods moves here. Otherwise, play doesn't make sense.

            pods[j].move(1.0);
            pods[j].end();
        }
        //for now play means just move there, in the future we need consider collisions
         //play();
         for (int j=0; j<2; j++) {
             Checkpoint currentCheckpoint = checkpoints[pods[j].nextCheckpointId];

             //first check if we've already reached the current checkpoint
             float d = pods[j].distance2(&currentCheckpoint);
             if (d < 122500) { //radius - 50
                 //std::cout << "step: " << i << " " << d << " x: " << p.x << " y: " << p.y << std::endl;
             /*
            qDebug("Collision with");
            qDebug() << (myPod->nextCheckpointId) << d << myPod->x << myPod->y
                     << currentCheckpoint->x << currentCheckpoint->y; */
                 //std::cout << "hit checkpoint " << currentCheckpoint.id << " score: " << score + (p.checked +1)* 50000 << std::endl;
                 /*for (auto b: decode(solution)) {
                     std::cout << b << " ";
                 }
                 std::cout << std::endl; */
                 pods[j].checked++;
                 pods[j].nextCheckpointId = (pods[j].nextCheckpointId+1) % numCheckpoints;
                 //update score to indicate big hit!
                 score += pods[j].checked * 50000; //may need to lower the weight if the next few moves are not optimized.
             } else {
                 score -= sqrt(d); //the further, the lower the score
             }
         }
    }
    reload();
    return score;
}

bool Game::decideToKill(double fit) {
    return fit < -12500;
}


List<Move, 2> Game::calcNextMove() {
   List<Move, 2> bestMoves; //to be released in the run loop.
   //qDebug() << "allocating move**";
   //cerr << "inside calc: " << pods[0].nextCheckpointId << " " << pods[0].angle << " "
   //           << pods[0].distance(&checkpoints[pods[0].nextCheckpointId]) << endl;
   Population<float> population(populationSize, 1000, this);
   population.generate();
   std::vector<float> aiMoves = generateAIMoves();
   population.seedSolution(aiMoves);
   population.doFitness();

   unsigned long long t0 = timeNow();
   unsigned long long t1 = t0;
   unsigned int sum = 0;
   int duration = 140;

   while ((int)(t1-t0) < duration) {
       //if (abort) {
       //   qDebug("abort called...clean up.");
        //   return bestMoves;
       //}
       sum++;
       population.crossover();
       population.mutate();
       population.doFitness();

       t1 = timeNow();

   }

  //qDebug("total iterations: ");
  //qDebug() << sum;
  cerr << "total iterations: " << sum << endl;

   solution<float> bestSolution = population.getFittest(population.getSolutions());
   std::vector<float> moves = decode(bestSolution.chromosomes);
   for (int i=0; i<2; i++) {

       //std::cout << "moves size: " << moves.size() << std::endl;
       Move move(moves[0 + 12 * i], moves[1 + 12 * i]);
       bestMoves[i] = move;
   }

   //qDebug("winning solution");
   //qDebug() << maxScoreIndex;


  // qDebug() << sum << " iterations";


   return bestMoves;
}

void Game::play() {
    // This tracks the time during the turn. The goal is to reach 1.0
    float t = 0.0;
    int numPods = 2;
    //safety measure to prevent infinite loop
    Collision * prevCollision = nullptr;

    while (t < 1.0) {
        Collision* firstCollision = nullptr;
        if (abort) {
            //qDebug("Abort called from within play()");
            return;
        }

        // We look for all the collisions that are going to occur during the turn
        for (int i = 0; i < numPods; ++i) {
            // Collision with another pod?
            for (int j = i + 1; j < numPods; ++j) {
                Collision* col = pods[i].collision(&pods[j]); //found a collision

                // If the collision occurs earlier than the one we currently have we keep it
                if (col != nullptr && col->t + t < 1.0 && (firstCollision == nullptr || col->t < firstCollision->t)) {
                    if (firstCollision) {
                        delete firstCollision; //release before assign a new one
                        firstCollision = nullptr;
                    }
                    firstCollision = col;
                } else {
                    if (col) delete col; //need to clean this up before the second loop;
                }
            }

            // Collision with another checkpoint?
            // It is unnecessary to check all checkpoints here. We only test the pod's next checkpoint.
            // We could look for the collisions of the pod with all the checkpoints, but if such a collision happens it wouldn't impact the game in any way
            //No need to check checkpoints collision at this point, it's not correct anyway.
            //Collision col = pods[i].collision(checkpoints[pods[i].nextCheckpointId]);

            // If the collision happens earlier than the current one we keep it
            /*if (col != null && col.t + t < 1.0 && (firstCollision == null || col.t < firstCollision.t)) {
                firstCollision = col;
            }*/
        }
        if (firstCollision) {
           // qDebug() << firstCollision->t;
            if (prevCollision != nullptr && prevCollision->t == 0 &&
                firstCollision->t == prevCollision->t && prevCollision->a == firstCollision->a &&
                prevCollision->b == firstCollision->b) {
                    delete firstCollision;
                    firstCollision = nullptr; //ignore it since we've already seen it with zero t and same two units
            }
        }

        if (firstCollision == nullptr) {
            // No collision, we can move the pods until the end of the turn
            for (int i = 0; i < numPods; ++i) {
                pods[i].move(1.0 - t);
            }

            // End of the turn
            t = 1.0;
        } else {
            // Move the pods to reach the time `t` of the collision
            for (int i = 0; i < numPods; ++i) {
                pods[i].move(firstCollision->t);
            }

            // Play out the collision
         firstCollision->a->bounce(firstCollision->b);

            t += firstCollision->t;
            if (prevCollision) delete prevCollision;
            prevCollision = new Collision(firstCollision->a, firstCollision->b, firstCollision->t); //save a copy for safty check.
            delete firstCollision;
            firstCollision = nullptr;
        }
    }
    if (prevCollision) {
        delete prevCollision;
    }
    for (int i = 0; i < numPods; ++i) {
        pods[i].end();
    }
}



void Game::output(const List<Move, 2> & moves) {
    for (int i=0; i<2; i++) {
    float a = pods[i].angle + moves[i].angle;

    if (a >= 360.0) {
        a = a - 360.0;
    } else if (a < 0.0) {
        a += 360.0;
    }

    // Look for a point corresponding to the angle we want
    // Multiply by 10000.0 to limit rounding errors
    a = a * Pi / 180.0;
    float px = pods[i].x + cos(a) * 10000.0;
    float py = pods[i].y + sin(a) * 10000.0;

    //if (move.shield) {
    //    print(round(px), round(py), "SHIELD");
    //    activateShield();
    //} else {
    string thrust = std::to_string(moves[i].thrust);
    if (moves[i].thrust > 100) {
        pods[i].usedBoost = true;
        thrust = "BOOST";
    }

    cout << round(px) << " " <<  round(py) << " " << thrust << endl;
    }
   // }
}

/*
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
*/

int main()
{
    srand (time(NULL));
    int laps;
    cin >> laps; cin.ignore();
    int checkpointCount;
    cin >> checkpointCount; cin.ignore();
    Game theGame;
    theGame.numCheckpoints = checkpointCount;
    /*List<Checkpoint, 8> checkpoints; //up to 8 checkpoints
    List<Pod, 4> pods;
    theGame.checkpoints = checkpoints;
    theGame.pods = pods;*/

    for (int i = 0; i < checkpointCount; i++) {
        int checkpointX;
        int checkpointY;
        cin >> checkpointX >> checkpointY; cin.ignore();
        //cerr << checkpointX << " " << checkpointY << endl;
        Checkpoint c(i, checkpointX, checkpointY, 600);
        theGame.checkpoints[i] = c;
    }

   // cerr << "checkpoing 1: " << theGame.checkpoints[1].x << " " << theGame.checkpoints[1].y << endl;
     
    //int longestCheckpointStart = theGame.findLongestCheckpoint(); //this will find the longest distance
    //bool usedBoost1 = false;
    //bool usedBoost2 = false;

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
            theGame.pods[i].id = i;
            theGame.pods[i].x = x, theGame.pods[i].y = y; theGame.pods[i].nextCheckpointId = nextCheckPointId;
            theGame.pods[i].vx = vx; theGame.pods[i].vy = vy; theGame.pods[i].angle = angle;  
            //float d = theGame.pods[i].distance2(&theGame.checkpoints[theGame.pods[0].nextCheckpointId]);
             //cache the distance in theGame.
            //theGame.distanceToCheckpoint[i] = d;
            //cerr << i << "pod " << i << " angle: " << theGame.pods[i].angle << " "
            //    << theGame.pods[i].x << " " << theGame.pods[i].y << " " << theGame.pods[i].vx << " " << theGame.pods[i].vy
            //     << " " << theGame.pods[i].nextCheckpointId << endl;
        }
        

        for (int i = 2; i < 4; i++) {
            int x2; // x position of the opponent's pod
            int y2; // y position of the opponent's pod
            int vx2; // x speed of the opponent's pod
            int vy2; // y speed of the opponent's pod
            int angle2; // angle of the opponent's pod
            int nextCheckPointId2; // next check point id of the opponent's pod
            cin >> x2 >> y2 >> vx2 >> vy2 >> angle2 >> nextCheckPointId2; cin.ignore();
            theGame.pods[i].id = i;
            theGame.pods[i].x = x2, theGame.pods[i].y = y2; theGame.pods[i].nextCheckpointId = nextCheckPointId2;
            theGame.pods[i].vx = vx2; theGame.pods[i].vy = vy2; theGame.pods[i].angle = angle2; 
            
        }
        theGame.origPods = theGame.pods; //clone 

        if (theGame.pods[0].angle < 0) { //first round
            cout << theGame.checkpoints[1].x << " " << theGame.checkpoints[1].y << " BOOST" << endl;
            cout << theGame.checkpoints[1].x << " " << theGame.checkpoints[1].y << " BOOST" << endl;
            continue; 
        }
        List<Move, 2> moves = theGame.calcNextMove(); //TODO: this will need to return 2 moves.


       //cerr << theGame.pods[0].nextCheckpointId << " " << theGame.pods[0].angle << " " << moves[0].angle << " " << moves[0].thrust << " "
       //       << theGame.pods[0].distance(&theGame.checkpoints[theGame.pods[0].nextCheckpointId]) << endl;
         
        /*if (!usedBoost && laps > 1 && currentCheckpointId-1 == longestCheckpointStart && std::abs(nextCheckpointAngle) < 20) {
            usedBoost = true;
            cout << nextCheckpointX << " " << nextCheckpointY << " BOOST" << endl;
        } else { */
        
        theGame.output(moves);
       /* }*/

       // cerr << "vx: " << myPod->vx << " vy: " << myPod->vy << " angle: " << myPod->angle << " diffAngle " << nextCheckpointAngle << endl; 
        //cout << nextCheckpointX << " " << nextCheckpointY << " " << thrust << " vx: " << myPod->vx << " vy: " << myPod->vy << " angle: " << myPod->angle << endl;

    }
}