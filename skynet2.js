/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 **/

var inputs = readline().split(' ');
//printErr('initial:' + inputs);
var N = parseInt(inputs[0]); // the total number of nodes in the level, including the gateways
var L = parseInt(inputs[1]); // the number of links
var E = parseInt(inputs[2]); // the number of exit gateways
var graph = new Graph(); //storing adjacent list for the graph
var exits = []; //storing an array of exits


for (var i = 0; i < L; i++) {
	var inputs = readline().split(' ');
	var N1 = inputs[0]; // N1 and N2 defines a link between these nodes
	var N2 = inputs[1];
	graph.addEdge(N1, N2);
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
	
	var t1 = new Date().getTime();
    var cuttables = []; //array of links
    var criticalNodes = []; //array of critical nodes that connect to more than one exits
    var candidateNodes = []; //array of nodes that are connected to exits
    var n1 = -1, n2 = -1; //the link to cut
	//for (var i = 0; i < exits.length; i++) {
    exits.forEach(exit => {
        //collect links that are cuttable
        graph.neighbors[exit].forEach(node => {
            cuttables.push([node, exit]);
            candidateNodes.push(node);
        });
    });
    
    //printErr('cuttables:' + cuttables);
    //printErr('candidateNodes: ' + candidateNodes);
    var nodeMap = {}; //node => occurance when it connects to an exit
    for (var i=0; i<cuttables.length; i++) {
        if (cuttables[i][0] === SI) {
            //cut any link that's connects the agent to an exit
            n1 = SI;
            n2 = cuttables[i][1];
           break;
        } else { //set up nodeMap
            if (nodeMap[cuttables[i][0]] !== undefined) {
                nodeMap[cuttables[i][0]]++;
            } else {
                nodeMap[cuttables[i][0]] = 1;
            }
        }
    }
    //printErr('nodeMap' + JSON.stringify(nodeMap));
    if (n1 < 0 && n2 < 0) {
        //find nodes that connects to multiple exits, then calculate cost to travel to each, cut the one with minimum cost
        var criticalNodes = candidateNodes.filter((item, pos, a) => {
            return nodeMap[item] > 1 && a.indexOf(item) === pos;
        });
        //printErr('criticalNodes:' + criticalNodes);

        //now find out the critical node that is shortest to the agent
        var minCost = Number.MAX_SAFE_INTEGER;
        var node = -1;
        for (var i=0; i<criticalNodes.length; i++) {
            var cost = visit(graph, SI, criticalNodes[i]);
            if (cost < minCost) {
                minCost = cost;
                node = criticalNodes[i];
            }
        }
        if (node !== -1) {
            printErr('Critical cut with cost!' + minCost);
            n1 = node;
            var l = cuttables.filter(link => {
                return link[0] === n1;
            });
            n2 = l[0][1];
            //n2 = graph.neighbors[n1][0]; //cut the first exit connected to this node
        } else { 
            printErr('Random cut!');
            //just randomly cut one
            n1 = cuttables[0][0];
            n2 = cuttables[0][1];
        }
    }
    //printErr('n1:' + n1 + 'n2:'+ n2);
	var t2 = new Date().getTime();
    printErr('Elapsed time: ' + (t2-t1) + 'ms.');
	graph.removeEdge(n1, n2);
	print(n1 + ' ' + n2);
}

function isExit(node) {
    return exits.indexOf(node) > -1;
}
//implementing shortest finding using BFS.
function Graph() {
	var neighbors = this.neighbors = {}; // Key = vertex, value = array of neighbors.

	this.addEdge = function (u, v) {
		if (neighbors[u] === undefined) { // Add the edge u -> v.
			neighbors[u] = [];
		}
		neighbors[u].push(v);
		if (neighbors[v] === undefined) { // Also add the edge v -> u so as
			neighbors[v] = []; // to implement an undirected graph.
		} // For a directed graph, delete
		neighbors[v].push(u); // these four lines.
	};

	this.removeEdge = function (u, v) {
		if (neighbors[u] !== undefined)
			neighbors[u].splice(neighbors[u].indexOf(v), 1);
		if (neighbors[v] !== undefined)
			neighbors[v].splice(neighbors[v].indexOf(n1), 1);
	};

	return this;
}
/*
function bfs(graph, source) {
	var queue = [{
			vertex: source,
			count: 0
		}],
		visited = {
			source: true
		},
		tail = 0;
	while (tail < queue.length) {
		var u = queue[tail].vertex,
			count = queue[tail++].count; // Pop a vertex off the queue.
		//print('distance from ' + source + ' to ' + u + ': ' + count);
		graph.neighbors[u].forEach(function (v) {
			if (!visited[v]) {
				visited[v] = true;
				queue.push({
					vertex: v,
					count: count + 1
				});
			}
		});
	}
}
*/

//returns the weighted cost of visting from src to dst
function visit(graph, src, dst) {
    class Visit {
        constructor(node, cost) {
            this.node = node;
            this.cost = cost;
        }
    };
    class Stack {
        constructor() {
            this.stacks = [];
        }
        isEmpty() {
            return this.stacks.length === 0;
        }
        push(node) {
            this.stacks.push(node);
        }
        pop() {
            return this.stacks.shift();
        }
    }
    var costs = new Map(); 
    
    ///used a local rray to avoid stack overflow
    var stack = new Stack();
    stack.push(new Visit(src, 0));

    while(!stack.isEmpty()) {
        var v = stack.pop();

        //Unvisited node or cheaper path?
        var cost = costs[v.node];
        if (cost === undefined || cost > v.cost) {
            //Updates the cost.
            costs[v.node] = v.cost;

            //Still not there?
            if (v.node != dst) {
                //Links connected to the visisted node.
                var connections = graph.neighbors[v.node]; 

                //The TRICK: Substracts 1 if the visited node is connected to a gateway
                for (var i=0; i<connections.length; i++) {
                    if (isExit(connections[i])) {
                        v.cost--;
                        break;
                    }
                }
                // Visit the neighbors.
                for (var i=0; i<connections.length; i++) {
                    if (!isExit(connections[i])) {
                        stack.push(new Visit(connections[i], v.cost+1));
                    }
                }

            }
        }
    }
    return costs[dst];
}


function shortestPath(graph, source, target) {
	if (source == target) { // Delete these four lines if
		//print(source);          // you want to look for a cycle
		return []; // when the source is equal to
	} // the target.
	var queue = [source],
		visited = {},
		predecessor = {},
		tail = 0;
	visited[source] = true;
	//console.log(visited);
	while (tail < queue.length) {
		var u = queue[tail++], // Pop a vertex off the queue.
			neighbors = graph.neighbors[u];
		for (var i = 0; i < neighbors.length; ++i) {
			var v = neighbors[i];
			if (visited[v]) {
				continue;
			}
			visited[v] = true;
			if (v === target) { // Check if the path is complete.
				var path = [v]; // If so, backtrack through the path.
				while (u !== source) {
					path.push(u);
					u = predecessor[u];
				}
				path.push(source);
				path.reverse();
				//console.log(path.join(' ==> '));
				return path;
			}
			predecessor[v] = u;
			queue.push(v);
		}
	}
	//print('there is no path from ' + source + ' to ' + target);
	return [];
}