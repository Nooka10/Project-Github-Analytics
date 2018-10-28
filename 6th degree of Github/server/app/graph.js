const Graphlib = require('@dagrejs/graphlib');
const mongoose = require('mongoose');
require('./models/graph.model');

const GraphModel = mongoose.model('Graph');

/**
 * Classe gérant le graphe modélisant les liens entre les utilisateurs et leurs followers.
 */
class Graph {
  /**
   * Construit un graphe vide s'il n'y en a pas dans la DB. Sinon, récupère celui enregistré.
   */
  constructor () {
    GraphModel.find()
      .exec()
      .then((g) => {
        if (g.length !== 0) {
          this.graphInstance = g[0];
          this.graph = Graphlib.json.read(JSON.parse(g[0].json));
        } else {
          this.graph = new Graphlib.Graph(
            // Ne fonctionne pas...! -> graph dirigé même avec l'option à false...
            // Du coup, je double volontairement les arcs lors de la création d'un lien entre deux utilisateurs.
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

  /**
   * Enregistre le graphe dans la DB.
   * @returns l'instance MongoDB du graphe qui vient d'être créée.
   */
  createGraphInDB () {
    this.graphInstance = new GraphModel({ json: JSON.stringify(Graphlib.json.write(this.graph)) }).save();
    return this.graphInstance;
  }

  /**
   * Met à jour le graphe enregistré dans la DB.
   * @returns {Promise|*|RegExpExecArray}
   */
  updateGraphInDB () {
    const id = this.graphInstance._id;
    return GraphModel.findByIdAndUpdate(id, { json: JSON.stringify(Graphlib.json.write(this.graph)) }, { new: true })
      .exec();
  }

  /**
   * Ajoute un noeud au graph. Le label reçu (le login de l'utilisateur) est utilisé comme id et comme label.
   * @param label, le nom du noeud.
   */
  addNode (label) {
    this.graph.setNode(label, label);
    this.updateGraphInDB();
  }

  /**
   * Ajoute une arrête au graph. L'arrête relie node1 et node2.
   * @param node1
   * @param node2
   */
  addEdge (node1, node2) {
    // comme la variable {directed:false} donnée à la création du graphe ne fonctionne pas (crée quand même un graph dirigé...), on crée un arc
    // dans les deux sens...

    if (node1 === undefined || node2 === undefined || node1 === '' || node2 === '') {
      return new Error('Veuillez passer un "usernameFrom" et un "usernameTo" dans le body de votre requête pour pouvoir ajouter un arc au graphe.');
    } else if (node1 === node2) {
      return new Error('"usernameFrom" et "usernameTo" ne doivent pas être identiques pour pouvoir ajouter un arc au graphe.');
    } else {
      this.graph.setEdge(node1, node2);
      this.graph.setEdge(node2, node1);
      this.updateGraphInDB();
      return undefined;
    }
  }

  /**
   * Retourne vrai si le noeud reçu en paramètre est présent dans le graph, false sinon.
   * @param node, le noeud dont on souhaite vérifier l'existence dans le graph.
   * @returns un booléen valant true si le noeud est présent dans le graph, false sinon.
   */
  hasGivenNode (node) {
    return this.graph.hasNode(node);
  }

  /**
   * Retourne un tableau contenant l'ensemble des noeuds du graph.
   * @returns un tableau contenant l'ensemble des noeuds du graph.
   */
  allNodes () {
    return this.graph.nodes();
  }

  edgeOfNode (node) {
    return this.graph.nodeEdges(node);
  }

  /**
   * Calcule le plus court chemin entre node1 et node2 à l'aide de l'algorithme de Dijkstra.
   * Retourne un objet JSON contenant la distance séparant les deux nodes ainsi que le chemin complet pour passer de l'un à l'autre.
   * @param node1
   * @param node2
   * @returns un objet JSON
   */
  smallestPathDijkstra (node1, node2) {
    const res = Graphlib.alg.dijkstra(this.graph, node1);

    if (res[node2] !== undefined && res[node2].distance !== Infinity) {
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

  /**
   * Calcule le plus court chemin entre node1 et node2 à l'aide d'un simple BFS.
   * Retourne un objet JSON contenant la distance séparant les deux nodes ainsi que le chemin complet pour passer de l'un à l'autre.
   * Fonctionne car nous utilisons un graphe non orienté dont toutes les arrêtes ont un poids de 1.
   * @param node1
   * @param node2
   * @returns un objet JSON
   */
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
    return `Il n'y a pas de chemin entre ${node1} et ${node2}.`;
  }
}

module.exports = Graph;
