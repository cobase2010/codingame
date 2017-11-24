import java.util.*;
import java.io.*;
import java.math.*;

/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/
class Player {

    public static void main(String args[]) {
        Scanner in = new Scanner(System.in);

        // game loop
        List<Unit> wrecks = new ArrayList<>();
        List<Unit> tankers = new ArrayList<>();
        List<Unit> oilPool = new ArrayList<>();
        List<Unit> tarPool = new ArrayList<>();
        Map<Integer, Unit> myUnits = new HashMap<>();
        Map<Integer, Unit> firstEnemyUnits = new HashMap<>();
        Map<Integer, Unit> secondEnemyUnits = new HashMap<>();

        while (true) {
            wrecks.clear();
            tankers.clear();
            myUnits.clear();
            oilPool.clear();
            tarPool.clear();
            firstEnemyUnits.clear();
            secondEnemyUnits.clear();
            int myScore = in.nextInt();
            int enemyScore1 = in.nextInt();
            int enemyScore2 = in.nextInt();
            int myRage = in.nextInt();
            int enemyRage1 = in.nextInt();
            int enemyRage2 = in.nextInt();
            int unitCount = in.nextInt();
            for (int i = 0; i < unitCount; i++) {
                int unitId = in.nextInt();
                int unitType = in.nextInt();
                int player = in.nextInt();
                float mass = in.nextFloat();
                int radius = in.nextInt();
                int x = in.nextInt();
                int y = in.nextInt();
                int vx = in.nextInt();
                int vy = in.nextInt();
                int extra = in.nextInt();
                int extra2 = in.nextInt();
                Unit u = new Unit(unitId, unitType, player, radius, vx, vy, extra, extra2, x, y, mass);
                if (unitType == 4) {
                    wrecks.add(u);
                } else if (unitType == 3) {
                    tankers.add(u);
                } else if (unitType == 6) {
                    oilPool.add(u);
                } else if (unitType == 5) {
                    tarPool.add(u);
                }
                if (player == 0) {
                    myUnits.put(unitType, u);
                } else if (player == 1) {
                    firstEnemyUnits.put(unitType, u);
                } else if (player == 2) {
                    secondEnemyUnits.put(unitType, u);
                }
            }

            // Write an action using System.out.println()
            // To debug: System.err.println("Debug messages...");
           
            //Collections.sort(wrecks, (a, b) -> compareDist(myUnits.get(0), a, b));
            
            Unit bestReaperEnemy = enemyScore1 > enemyScore2 ? firstEnemyUnits.get(0) : secondEnemyUnits.get(0);
            Unit myReaper = myUnits.get(0);
            Unit myDestroyer = myUnits.get(1);
            Unit myDoof = myUnits.get(2);
            Unit reaperTarget = myDestroyer;

            for (Unit w: wrecks) {
                w.myReaper = myReaper;
                w.firstEnemyReaper = firstEnemyUnits.get(0);
                w.secondEnemyReaper = secondEnemyUnits.get(0);
            }
            Collections.sort(wrecks, (a, b) -> compareDist(a, b));
            //looking for reaper targets
            /*double max = 10000;
            for (Unit u: wrecks) {
                double d = myReaper.dist(u);
                if (d < max) {
                    reaperTarget = u;
                    max = d;
                }
            }*/
            if (wrecks.size() > 0) {
                reaperTarget = wrecks.get(0);
            } 

            System.err.println("Reaper target: " + reaperTarget);
           
           //looking for doof target
            Unit doofTarget = bestReaperEnemy;
            boolean doofSpell = false;
            if (myRage > 30) {
                for (Unit w: wrecks) {
                    if (w.dist(bestReaperEnemy) < w.radius && myDoof.dist(w) < 2000) {
                        boolean oilOnPool = false;
                        for (Unit o: oilPool) {
                            if (o.dist(w) < o.radius) {
                                oilOnPool = true;
                                break;
                            }
                        }
                        if (!oilOnPool) {
                            doofTarget = w;
                            doofSpell = true;
                            //myRage -= 30;
                            break;
                        }
                    } 
                }
            }
            if (doofSpell) {
                myRage -= 30;
            }
            System.err.println("Doof target: " + doofTarget + " " + doofSpell);

            //looking for destroyer targets
            int maxWater = 0;
            Unit destroyerTarget = bestReaperEnemy;
            boolean foundWater = false;
            boolean destroyerSpell = false;
            for (Unit u: tankers) {
                int water = u.extra;
                if (maxWater < water && myReaper.dist(u) < firstEnemyUnits.get(0).dist(u) && myReaper.dist(u) < secondEnemyUnits.get(0).dist(u)) {
                    destroyerTarget = u;
                    maxWater = water;
                    foundWater = true;
                }
            }
            
            
            if (myRage > 60 && !foundWater) {
                destroyerSpell = true;
                myRage -= 60;
            }
            System.err.println("Destroyer target: " + destroyerTarget + " " + destroyerSpell);
            String thrust = "300";
            if (reaperTarget.dist(myReaper) < 2000) {
                thrust = "150";
            } else if (reaperTarget.dist(myReaper) < reaperTarget.radius) {
                thrust = "0";
            }
            System.out.println((reaperTarget.x - myReaper.vx) + " " + (reaperTarget.y - myReaper.vy) + " " + "300" + " Reaper");
            if (destroyerSpell) {
                System.out.println("SKILL " + (bestReaperEnemy.x - bestReaperEnemy.radius) + " " + (bestReaperEnemy.y - bestReaperEnemy.radius) + " 300" + " GRENADE!");
            } else {
                System.out.println((destroyerTarget.x /*- myDestroyer.vx*/) + " " + (destroyerTarget.y /* - myDestroyer.vy*/) + " 300" + " Destroyer");
            }
            if (!doofSpell) {
                System.out.println((doofTarget.x /*- myDoof.vx*/) + " " + (doofTarget.y /*- myDoof.vy*/) + " 300" + " DOOF");
            } else {
                System.out.println("SKILL " + doofTarget.x + " " + doofTarget.y + " 300" + " OILLLLL");
            }
        }
    }
    /*public static int compareDist(Pos m, Pos a, Pos b) {
        return m.dist(b) > m.dist(a) ? -1 : 1;
    }*/

    public static int compareDist(Unit a, Unit b) {
        return a.dist(a.myReaper) / (a.dist(a.firstEnemyReaper) + a.dist(a.secondEnemyReaper)) < b.dist(b.myReaper) / (b.dist(b.firstEnemyReaper) + b.dist(b.secondEnemyReaper)) ? -1 : 1;
    }
    
}
class Unit extends Pos {
    public int id, type, player, radius, vx, vy, extra, extra2;
    public double mass;
    //public Pos pos = null;
    public Unit myReaper = null;
    public Unit firstEnemyReaper = null;
    public Unit secondEnemyReaper = null;
    public Unit(int id, int type, int player, int radius, int vx, int vy, int extra, int extra2, int x, int y, double mass) {
        super(x, y);
        this.id = id;
        this.type = type;
        this.player = player;
        this.radius = radius;
        this.vx = vx;
        this.vy = vy;
        this.extra = extra;
        this.extra2 = extra2;
        //this.pos = new Pos(x, y);
        this.mass = mass;
    }
    @Override
    public String toString() {
        return "id: " + id + " x: " + x + " y: " + y;
    }
}
class Pos {
    public int x, y;
    public Pos(int x, int y) {
        this.x = x;
        this.y = y;
    }
    public double dist(Pos a) {
        return Math.sqrt((x - a.x) * (x - a.x) + (y - a.y) * (y - a.y));
    }
}

//GA gene: reaper angle, reaper thrust (-1 for skill), destroyer angle, destroyer thrust, doof angle, doof thrust
