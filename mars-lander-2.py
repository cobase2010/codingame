import sys
import math

G = 3.711

def moveRocket(x, y, vx, vy, fuel, rotate, thrust, r, p):
  """
  Move rocket with rotate and thrust
  """
  #can only move +/- 15 degree and +/- 1 thrust
  if rotate>r+15: rotate = r + 15
  if rotate<r-15: rotate = r-15
  if thrust>p+1: thrust = p+1
  if thrust<p-1: thrust = p-1
  
  x = x+vx-0.5*math.sin(rotate*math.pi/180.)*thrust
  y = y+vy+0.5*(math.cos(rotate*math.pi/180.)*thrust-G)
  vx = vx-1.*math.sin(rotate*math.pi/180.)*thrust
  vy = vy+1.*(math.cos(rotate*math.pi/180.)*thrust-G)
  return (x, y, vx, vy, rotate, thrust, fuel-thrust)

def calcNextMove(x, y, vx, vy, fuel, r, p, marsMap, flatX1, flatX2):

  return (-20, 3)

# Save the Planet.
# Use less Fossil Fuel.

def main():
  marsMap = []

  n = int(input())  # the number of points used to draw the surface of Mars.
  prevY = -1
  prevX = -1
  flatX1 = -1
  flatX2 = -1
  flatY = -1
  for i in range(n):
    # land_x: X coordinate of a surface point. (0 to 6999)
    # land_y: Y coordinate of a surface point. By linking all the points together in a sequential fashion, you form the surface of Mars.
    land_x, land_y = [int(j) for j in input().split()]
    marsMap.append((land_x, land_y))
    if land_y == prevY: 
      #print("we have a flat section from %d to %d at %d"%(prevX, land_x, land_y), file=sys.stderr)
      (flatX1, flatX2, flatY) = (prevX, land_x, land_y)
    prevX = land_x
    prevY = land_y

  x, y, vx, vy, fuel = 0.0, 0.0, 0.0, 0.0, 0.0
  angle, thrust = -20, 3
  i = 0
  # game loop
  while True:
    # hs: the horizontal speed (in m/s), can be negative.
    # vs: the vertical speed (in m/s), can be negative.
    # f: the quantity of remaining fuel in liters.
    # r: the rotation angle in degrees (-90 to 90).
    # p: the thrust power (0 to 4).
    X, Y, hs, vs, f, r, p = [int(i) for i in input().split()]
    print("At this turn: %d,%d,%d,%d,%d,%d,%d"% (X,Y,hs,vs,f,r,p), file=sys.stderr)

    if i == 0:
      x, y, vx, vy, fuel = X, Y, hs, vs, f
    i = i + 1   
    # Write an action using print
    # To debug: print("Debug messages...", file=sys.stderr)
    
    """
    if vx > 18:
        #print('inside if with angle: %d' %(angle), file=sys.stderr)
        if angle > 15:
            angle -= 15
        elif angle < -15:
            angle += 15
        elif angle >= -15 and angle <= 15:
            angle = 0
            #print('inside else with angle: %d' %(angle), file=sys.stderr)
    if vy < -30:
        thrust = 4
    else:
        thrust = 3
    """
    
    #optimize for the next move
    angle, thrust = calcNextMove(x, y, vx, vy, fuel, r, p, marsMap, flatX1, flatX2)
    
    x, y, vx, vy, angle, thrust, fuel = moveRocket(x, y, vx, vy, fuel, angle, thrust, r ,p)
    print("x:%d, y:%d, angle: %d, thrust:%d, vx:%f, vy:%f, fuel:%d"%(round(x), round(y), angle, thrust, round(vx), round(vy), fuel),file=sys.stderr)

    # R P. R is the desired rotation angle. P is the desired thrust power.
    print(angle, thrust)

if __name__ == '__main__':
  main()
