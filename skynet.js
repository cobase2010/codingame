/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

var inputs = readline().split(' ');
//printErr('initial:' + inputs);
var N = parseInt(inputs[0]); // the total number of nodes in the level, including the gateways
var L = parseInt(inputs[1]); // the number of links
var E = parseInt(inputs[2]); // the number of exit gateways
var graph = {}; //storing the edges in node: [node1, node2] format
var exits = [];

for (var i = 0; i < L; i++) {
    var inputs = readline().split(' ');
    var N1 = inputs[0]; // N1 and N2 defines a link between these nodes
    var N2 = inputs[1];
    addEdge(graph, N1, N2);
}
for (var i = 0; i < E; i++) {
    var EI = readline(); // the index of a gateway node
    exits.push(EI);
    //printErr('exits: ' + exits);
}

//printErr(JSON.stringify(graph));
// game loop
while (true) {
    var SI = readline(); // The index of the node on which the Skynet agent is positioned this turn
    //Need to implement Karger's algorithm or
    //find the path between two points, go through each vertix and cut the edge that has least number of edges or
    //Solution: from the agent, check each edge to see if it's connected to an exit, if yes, cut, otherwise, randomly cut one'
    //printErr('current SI:' + SI);
    var n1 = -1;
    var n2 = -1;
    if (graph[SI]) {
      //printErr('current edges:' + graph[SI]);
      for (var i=0; i<graph[SI].length; i++) {
        //check if it connects to one of the exits
        var index = exits.indexOf(graph[SI][i]);
        //printErr('exists:' + exits.indexOf(graph[SI][i]) + ' between ' + exits + " and " + graph[SI]);
        if (index > -1) {
          n1 = SI;
          n2 = exits[index];
          //remove edge from here
          removeEdge(graph, n1, n2);
          break;
        } else {
          continue;
        }
      }
      if (n1 === -1) { //not connected to exit, randomly cut one
          n1 = SI;
          n2 = graph[SI][0];
          removeEdge(graph, n1, n2);
      }
    } else {
      //do nothing
    }
    // Write an action using print()
    // To debug: printErr('Debug messages...');


    // Example: 0 1 are the indices of the nodes you wish to sever the link between
    //printErr(JSON.stringify(graph));
    print('' + n1 + ' ' + n2);
}

function addEdge(graph, n1, n2) {
  if (graph[n1]) {
      graph[n1].push(n2);
  } else {
      graph[n1] = [n2];
  }
  if (graph[n2]) {
      graph[n2].push(n1);
  } else {
      graph[n2] = [n1];
  }
}

function removeEdge(graph, n1, n2) {
  graph[n1].splice(graph[n1].indexOf(n2), 1);
  graph[n2].splice(graph[n2].indexOf(n1), 1);
}

/*
const rl = x=>readline().split(" ").map(x=>+x);
const r = x=>+readline();
const ra = x=>new Array(x).fill();

const info = rl();

let nodes = ra(info.shift());
let links = ra(info.shift());
let exits = ra(info.shift());

links = links.map(l=>rl());
exits = exits.map(e=>r());

nodes = nodes.map((n,i)=>links.filter(l=>~l.indexOf(i)).map(l=>l[l[0]==i?1:0]));

while (true) {
    const agent = r();
    const dists = new Array(nodes.length).fill(-1);
    
    nodes.map((n,i)=>dists[i]=~n.indexOf(agent)?1:-1);
    nodes.map((n,i)=>{if(n.length == 0) dists[i] = Infinity});
    
    while(~dists.indexOf(-1)) {
        dists.map((d,i)=>[d,i]).filter(d=>d[0]>0).map(d=>d[1]).map(d=>[nodes[d],d])
        .map(s=>{
            s[0].filter(i=>dists[i]<0).map(i=>dists[i]=dists[s[1]]+1);
        })
    }
    dists[agent] = 0;
    
    const closest = a => {
        let list = a.map(n=>[dists[n],n]).sort((a,b)=>a[0]-b[0]);
        list = list.filter(l=>l[0]==list[0][0]);
        return list[0|Math.random()*list.length][1];
    }
    
    const closestExit = closest(exits);
    const exit = nodes[closestExit];
    
    const closestNode = closest(exit);
    const node = nodes[closestNode];
    
    exit.splice(exit.indexOf(closestNode),1);
    node.splice(node.indexOf(closestExit),1);
    
    if (exit.length == 0) {
        exits.splice(exits.indexOf(closestExit), 1);
        dists[closestExit] = Infinity;
    }
    
    print(closestExit + " " + closestNode);
}
*/
