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
            // FIXME: ne fonctionne pas -> graph dirigé même avec l'option à false...
            {
              directed: false
            }
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

  hasGivenNode (node) {
    return this.graph.hasNode(node);
  }

  allNodes () {
    return this.graph.nodes();
  }

  smallestPath (node1, node2) {
    const res = Graphlib.alg.dijkstra(this.graph, node1);

    if (res[node2].distance !== Infinity) {
      const path = [node2]; // On reconstruit le chemin à l'envers
      let u = res[node2].predecessor;
      while (u !== node1) {
        path.push(u);
        u = res[u].predecessor;
      }
      path.push(u);
      path.reverse();
      return {
        dist  : res[node2].distance,
        pathTo: path
      };
    } else {
      return new Error(`Il n'y a pas de chemin entre ${node1} et ${node2}.`);
    }
  }

  bfs (node1, node2) {
    const queue = [node1];
    const nodes = this.graph.nodes();
    const dist = {};
    nodes.forEach(n => dist[n] = -1);
    dist[node1] = 0;
    const pred = {};
    let tail = 0;

    while (tail < queue.length) {
      let u = queue[tail++];
      const neighbors = this.graph.neighbors(u);
      for (let i = 0; i < neighbors.length; ++i) {
        const v = neighbors[i];
        if (dist[v] === -1) { // si le noeud n'a pas encore été visité
          dist[v] = dist[u] + 1;
          pred[v] = u;
          queue.push(v);
        }
        if (v === node2) { // On a trouvé le noeud recherché.
          const path = [v]; // On reconstruit le chemin à l'envers
          while (u !== node1) {
            path.push(u);
            u = pred[u];
          }
          path.push(u);
          path.reverse();
          return {
            dist  : dist[node2],
            pathTo: path
          };
        }
      }
    }
    return new Error(`Il n'y a pas de chemin entre ${node1} et ${node2}.`);
  }
}

module.exports = Graph;
