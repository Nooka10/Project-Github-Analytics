const Graphlib = require('@dagrejs/graphlib');
const mongoose = require('mongoose');
require('./models/graph.model');

const GraphModel = mongoose.model('Graph');

class Graph {
  constructor () {
    GraphModel.find()
      .exec()
      .then((g) => {
        if (g.length !== 0) {
          this.graphInstance = g[0];
          this.graph = Graphlib.json.read(JSON.parse(g[0].json));
        } else {
          this.graph = new Graphlib.Graph(
            /* // FIXME: ne fonctionne pas -> graph dirigé même avec l'option à false...
            {
              directed  : false
            }
            */
          );
          this.createGraphInDB()
            .then((res) => {
              this.graphInstance = res;
              return this.updateGraphInDB();
            });
        }
      });
  }

  createGraphInDB () {
    this.graphInstance = new GraphModel({ json: JSON.stringify(Graphlib.json.write(this.graph)) }).save();
    return this.graphInstance;
  }

  updateGraphInDB () {
    const id = this.graphInstance._id;
    return GraphModel.findByIdAndUpdate(id, { json: JSON.stringify(Graphlib.json.write(this.graph)) }, { new: true })
      .exec();
  }

  addNode (id, label) {
    this.graph.setNode(id, label);
    this.updateGraphInDB();
  }

  getNode (id) {
    return this.graph.node(id); // retourne le label correspondant à cet id.
  }

  addEdge (node1, node2, label) {
    this.graph.setEdge(node1, node2, label);
    this.graph.setEdge(node2, node1, label);
    this.updateGraphInDB();
  }

  getEdge (node1, node2) {
    return this.graph.edge(node1, node2); // retourne le label de l'edge liant les 2 noeuds.
  }

  smallestPath (node1, node2) {
    const res = Graphlib.alg.dijkstra(this.graph, node1);
    // console.log(res);
    return res;
  }

  /*
  bfs (node1, node2) {
    const queue = [node1];
    const visited = { node1: true };
    const predecessor = {};
    let tail = 0;

    while (tail < queue.length) {
      let u = queue[tail++]; // Pop a vertex off the queue.
      const neighbors = this.graph.neighbors(u);
      for (let i = 0; i < neighbors.length; ++i) {
        const v = neighbors[i];
        if (visited[v]) {
          continue;
        }
        visited[v] = true;
        if (v === node2) { // Check if the path is complete.
          const path = [v]; // If so, backtrack through the path.
          while (u !== node1) {
            u = predecessor[u];
            path.push(u);
          }
          path.reverse();
          console.log(path.join(' &rarr; '));
          return;
        }
        predecessor[v] = u;
        queue.push(v);
      }
    }
    console.log(`there is no path from ${node1} to ${node2}`);
  }
  */

  hasGivenNode (node) {
    return this.graph.hasNode(node);
  }

  allNodes () {
    return this.graph.nodes();
  }
}

module.exports = Graph;
