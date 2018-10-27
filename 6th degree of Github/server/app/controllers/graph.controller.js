const express = require('express');
const httpStatus = require('http-status');

const router = express.Router();

router.post('/addEdge', (req, res, next) => {
  const graph = req.app.get('graph');
  const { usernameFrom, usernameTo } = req.body;
  if (usernameFrom !== undefined && usernameTo !== undefined) {
    graph.addEdge(usernameFrom, usernameTo); // on ajoute une arrête (non dirigée) reliant usernameFrom à usernameTo dans le graph.
    graph.updateGraphInDB()
      .then(() => {
        res.status(httpStatus.OK)
          .send(`l'edge reliant ${usernameFrom} à ${usernameTo} a bien été ajouté.`);
      })
      .catch(err => res.status(httpStatus.INTERNAL_SERVER_ERROR)
        .send(
          {
            status: httpStatus.INTERNAL_SERVER_ERROR,
            title : err.title,
            error : err.message
          }
        ));
  } else {
    res.status(httpStatus.OK)
      .send('Veuillez passer un "usernameFrom" et un "usernameTo" dans le body de votre requête pour pouvoir ajouter un arc au graphe.');
  }
});

function checkUsers (userFrom, userTo, graph) {
  const nodes = graph.allNodes();
  if (!graph.hasGivenNode(userFrom) && !graph.hasGivenNode(userTo)) {
    return {
      usersAreOk: false,
      message   : `Les utilisateurs recherchés ne se trouvent pas dans le graph. Veuillez essayer avec l'un de ces utilisateurs: [${nodes}]`
    };
  } else if (!graph.hasGivenNode(userFrom)) {
    return {
      usersAreOk: false,
      message   : `L\'utilisateur ${userFrom} ne se trouvent pas dans le graph. Veuillez essayer avec l'un de ces utilisateurs: [${nodes}]`
    };
  } else if (!graph.hasGivenNode(userTo)) {
    return {
      usersAreOk: false,
      message   : `L\'utilisateur ${userTo} ne se trouvent pas dans le graph. Veuillez essayer avec l'un de ces utilisateurs: [${nodes}]`
    };
  }
  if (userTo === userFrom) {
    return {
      usersAreOk: false,
      message   : `Les deux utilisateurs entrés sont les mêmes. Veuillez recommencer avec deux utilisateurs différents parmis les suivants: [${nodes}]`
    };
  }
  return {
    usersAreOk: true,
    message   : ''
  };
}

router.get('/dijkstra', (req, res, next) => {
  const userFrom = req.query.usernamefrom;
  const userTo = req.query.usernameto;

  const graph = req.app.get('graph');
  const usersOk = checkUsers(userFrom, userTo, graph);
  if (!usersOk.usersAreOk) {
    res.status(httpStatus.OK)
      .send(usersOk.message);
  } else {
    const smallestPaths = graph.smallestPath(userFrom, userTo);
    if (smallestPaths) {
      res.status(httpStatus.OK)
        .send(smallestPaths);
    }
  }
});

router.get('/bfs', (req, res, next) => {
  const userFrom = req.query.usernamefrom;
  const userTo = req.query.usernameto;

  const graph = req.app.get('graph');
  const usersOk = checkUsers(userFrom, userTo, graph);
  if (!usersOk.usersAreOk) {
    res.status(httpStatus.OK)
      .send(usersOk.message);
  } else {
    const smallestPaths = graph.bfs(userFrom, userTo);
    if (smallestPaths) {
      res.status(httpStatus.OK)
        .send(smallestPaths);
    }
  }
});

module.exports = router;
