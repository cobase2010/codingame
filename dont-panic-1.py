import sys
import math

# Auto-generated code below aims at helping you parse
# the standard input according to the problem statement.

# nb_floors: number of floors
# width: width of the area
# nb_rounds: maximum number of rounds
# exit_floor: floor on which the exit is found
# exit_pos: position of the exit on its floor
# nb_total_clones: number of generated clones
# nb_additional_elevators: ignore (always zero)
# nb_elevators: number of elevators
nb_floors, width, nb_rounds, exit_floor, exit_pos, nb_total_clones, nb_additional_elevators, nb_elevators = [int(i) for i in input().split()]
elevators = {}
for i in range(nb_elevators):
    # elevator_floor: floor on which this elevator is found
    # elevator_pos: position of the elevator on its floor
    elevator_floor, elevator_pos = [int(j) for j in input().split()]
    #print("adding "+str(elevator_floor)+" to dictionary", file=sys.stderr)
    elevators[elevator_floor] = elevator_pos

# game loop
while True:
    # clone_floor: floor of the leading clone
    # clone_pos: position of the leading clone on its floor
    # direction: direction of the leading clone: LEFT or RIGHT
    clone_floor, clone_pos, direction = input().split()
    clone_floor = int(clone_floor)
    clone_pos = int(clone_pos)

    # Write an action using print
    # To debug: print("Debug messages...", file=sys.stderr)

    #print(elevators,nb_elevators,exit_floor, clone_floor, file=sys.stderr)
    if clone_floor == -1 and clone_pos == -1 and direction == 'NONE':
      print("WAIT")
    elif exit_floor == clone_floor and exit_pos < clone_pos and direction == 'RIGHT':
      print("BLOCK")
    elif exit_floor == clone_floor and exit_pos > clone_pos and direction == 'LEFT':
      print("BLOCK")
    elif exit_floor > clone_floor and elevators[clone_floor] < clone_pos and direction == 'RIGHT':
      print("BLOCK")
    elif exit_floor > clone_floor and direction == 'LEFT' and elevators[clone_floor] > clone_pos:
      print("BLOCK")
    else:
      print("WAIT")
    # action: WAIT or BLOCK
    
