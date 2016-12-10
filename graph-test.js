function Graph() {
  var neighbors = this.neighbors = {}; // Key = vertex, value = array of neighbors.

  this.addEdge = function (u, v) {
    if (neighbors[u] === undefined) {  // Add the edge u -> v.
      neighbors[u] = [];
    }
    neighbors[u].push(v);
    if (neighbors[v] === undefined) {  // Also add the edge v -> u so as
      neighbors[v] = [];               // to implement an undirected graph.
    }                                  // For a directed graph, delete
    neighbors[v].push(u);              // these four lines.
  };

  return this;
}

function bfs(graph, source) {
  var queue = [ { vertex: source, count: 0 } ],
      visited = { source: true },
      tail = 0;
  while (tail < queue.length) {
    var u = queue[tail].vertex,
        count = queue[tail++].count;  // Pop a vertex off the queue.
    //print('distance from ' + source + ' to ' + u + ': ' + count);
    graph.neighbors[u].forEach(function (v) {
      if (!visited[v]) {
        visited[v] = true;
        queue.push({ vertex: v, count: count + 1 });
      }
    });
  }
}

function shortestPath(graph, source, target) {
  if (source == target) {   // Delete these four lines if
    //print(source);          // you want to look for a cycle
    return [];                 // when the source is equal to
  }                         // the target.
  var queue = [ source ],
      visited = {},
      predecessor = {},
      tail = 0;
  visited[source] = true;
  console.log(visited);
  while (tail < queue.length) {
    var u = queue[tail++],  // Pop a vertex off the queue.
        neighbors = graph.neighbors[u];
    for (var i = 0; i < neighbors.length; ++i) {
      var v = neighbors[i];
      if (visited[v]) {
        continue;
      }
      visited[v] = true;
      if (v === target) {   // Check if the path is complete.
        var path = [ v ];   // If so, backtrack through the path.
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

var t0 = new Date().getTime();
var graph = /*new Graph();
  graph.addEdge('A', 'B');
  graph.addEdge('B', 'C');
  graph.addEdge('B', 'E');
  graph.addEdge('C', 'D');
  graph.addEdge('C', 'E');
  graph.addEdge('C', 'G');
  graph.addEdge('D', 'E');
  graph.addEdge('E', 'F');
*/
{"neighbors":{"0":["2","1","3"],"1":["7","0","3"],"2":["6","0","3"],"3":["7","6","5","4","0","1","2"],"4":["3","7"],"5":["3","6"],"6":["2","3","5"],"7":["3","1","4"]}};
  //bfs(graph, 'A');
  //print();
  var path = shortestPath(graph, '3', '5');
  var t1 = new Date().getTime();
  console.log(''+ (t1-t0) + 'ms elapsed');
  console.log(path);
  //print();
 // path = shortestPath(graph, 'G', 'A');
  //console.log(path);