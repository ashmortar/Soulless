
function Node(value) {
  this.value = value;
  this.edges = [];
  this.searched = false;
  this.parent = null;
}

function Graph() {
  this.nodes = [];
  this.graph = {};
  this.end = null;
  this.start = null;
}

add node
add edge

var queue = [];

start.searched = true;
queue.push(start);

while (queue.length > 0) {
  var current = queue.shift;
  
  if (current = end) {
    console.log(current.value);
    break;
  }
  var edges = current.edges;
  for (var i = 0; i < current.edges.length; i ++) {
    var neighbor = edges[i];
    if (!neighbor.searched) {
      neighbor.searched = true;
      neighbor.parent = current;
      queue.push(neighbor);
    }
  }
}

var path = [];
path.push(graph.end)
var next = end.parent;
while (next != null) {
  path.push(next);
  next = next.parent;
}