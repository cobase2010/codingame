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
        int W = in.nextInt(); // number of columns.
        int H = in.nextInt(); // number of rows.
        int [][] map = new int[W][H];
        if (in.hasNextLine()) {
            in.nextLine();
        }
        for (int i = 0; i < H; i++) {
            String LINE = in.nextLine(); // represents a line in the grid and contains W integers. Each integer represents one room of a given type.
            //Create a map to store room and type
            String lines[] = LINE.split(" ");
            
            for (int j = 0; j < lines.length; j++) {
                map[j][i] = Integer.parseInt(lines[j]);
                System.err.println("" + j + "," + i + ":" + map[j][i]);
            }

        }
        
        int EX = in.nextInt(); // the coordinate along the X axis of the exit (not useful for this first mission, but must be read).

        // game loop
        while (true) {
            int XI = in.nextInt();
            int YI = in.nextInt();
            String POS = in.next();

            // Write an action using System.out.println()
            // To debug: System.err.println("Debug messages...");

            int currentRoom = map[XI][YI];
            System.err.println("Current room:" + currentRoom);
            int nextX = 0;
            int nextY = 0;
            switch (currentRoom) {
                case 1: 
                case 3:
                case 7:
                case 8:
                case 9:
                case 12:
                case 13:
                {
                    nextX = XI; 
                    nextY = YI + 1; 
                    break;
                }
                case 2: 
                case 6:
                {
                    if (POS == "LEFT") {
                        nextX = XI; nextY = YI+1;
                    } else {
                        nextX = XI; nextY = YI-1;
                    }
                    break;
                }
                case 4: 
                case 10:
                {
                    if (POS == "TOP") {
                        nextX = XI; nextY = YI-1;
                    } else if (POS == "RIGHT") {
                        nextX = XI+1; nextY = YI;
                    }
                    break;

                }
                case 5:
                case 11:
                {
                    if (POS == "TOP") {
                        nextX = XI; nextY = YI + 1;
                    } else {
                        nextX = XI+1; nextY = YI;
                    }
                    break;
                }
                default:
                    break;
            }
            // One line containing the X Y coordinates of the room in which you believe Indy will be on the next turn.
            System.out.println("" + nextX + " " + nextY);
        }
    }
}