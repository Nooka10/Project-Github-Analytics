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
            /* //FIXME: ne fonctionne pas -> graph dirigé même avec l'option à false...
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
      .exec()
      .then((res) => {
        // console.log(res);
      });
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
    let res = Graphlib.alg.dijkstra(this.graph, node1);
    // console.log(res);
    return res;
  }

  hasGivenNode(node){
    return this.graph.hasNode(node);
  }

  allNodes(){
    return this.graph.nodes();
  }
}

module.exports = Graph;
