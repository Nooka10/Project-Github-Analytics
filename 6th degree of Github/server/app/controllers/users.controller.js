const express = require('express');
const httpStatus = require('http-status');

const router = new express.Router();
const mongoose = require('mongoose');
require('../models/user.model');

const User = mongoose.model('User');

router.get('/', (req, res, next) => {
  const filter = {};
  if (req.query.login !== undefined) {
    filter.login = req.query.login;
  }
  if (req.query.visited !== undefined) {
    filter.visited = req.query.visited;
  }
  return User.find(filter).limit(+req.query.limit).exec()
    .then((users) => {
      res.status(httpStatus.OK)
        .send(users);
    });
});

router.get('/dijkstra', (req, res, next) => {
  const userFrom = req.query.usernamefrom;
  const userTo = req.query.usernameto;

  const graph = req.app.get('graph');
  if (!graph.hasGivenNode(userFrom) && !graph.hasGivenNode(userTo)) {
    const nodes = graph.allNodes();
    res.status(httpStatus.OK)
      .send(`Les utilisateurs recherchés ne se trouvent pas dans le graph. Veuillez essayer avec l'un de ces utilisateurs: [${nodes}]`);
    return;
  } else if (!graph.hasGivenNode(userFrom)) {
    const nodes = graph.allNodes();
    res.status(httpStatus.OK)
      .send(`L\'utilisateur ${userFrom} ne se trouvent pas dans le graph. Veuillez essayer avec l'un de ces utilisateurs: [${nodes}]`);
    return;
  } else if (!graph.hasGivenNode(userTo)) {
    const nodes = graph.allNodes();
    res.status(httpStatus.OK)
      .send(`L\'utilisateur ${userTo} ne se trouvent pas dans le graph. Veuillez essayer avec l'un de ces utilisateurs: [${nodes}]`);
    return;
  }

  const smallestPaths = graph.smallestPath(userFrom, userTo);
  if (smallestPaths) {
    res.status(httpStatus.OK)
      .send(smallestPaths);
  }
});

router.get('/bfs', (req, res, next) => {
  const userFrom = req.query.usernamefrom;
  const userTo = req.query.usernameto;

  const graph = req.app.get('graph');
  if (!graph.hasGivenNode(userFrom) && !graph.hasGivenNode(userTo)) {
    const nodes = graph.allNodes();
    res.status(httpStatus.OK)
      .send(`Les utilisateurs recherchés ne se trouvent pas dans le graph. Veuillez essayer avec l'un de ces utilisateurs: [${nodes}]`);
    return;
  } else if (!graph.hasGivenNode(userFrom)) {
    const nodes = graph.allNodes();
    res.status(httpStatus.OK)
      .send(`L\'utilisateur ${userFrom} ne se trouvent pas dans le graph. Veuillez essayer avec l'un de ces utilisateurs: [${nodes}]`);
    return;
  } else if (!graph.hasGivenNode(userTo)) {
    const nodes = graph.allNodes();
    res.status(httpStatus.OK)
      .send(`L\'utilisateur ${userTo} ne se trouvent pas dans le graph. Veuillez essayer avec l'un de ces utilisateurs: [${nodes}]`);
    return;
  }
  if (userTo === userFrom) {
    const nodes = graph.allNodes();
    res.status(httpStatus.OK)
      .send(`Les deux utilisateurs entrés sont les mêmes. Veuillez recommencer avec deux utilisateurs différents parmis les suivants: [${nodes}]`);
    return;
  }

  const smallestPaths = graph.bfs(userFrom, userTo);
  if (smallestPaths) {
    res.status(httpStatus.OK)
      .send(smallestPaths);
  }
});

router.get('/:id', (req, res, next) => User.findById(req.params.id)
  .then((user) => {
    if (user !== null) {
      res.status(httpStatus.OK)
        .send(user);
    } else {
      res.status(httpStatus.NO_CONTENT)
        .send();
    }
  })
  .catch((err) => {
    res.status(httpStatus.INTERNAL_SERVER_ERROR)
      .send(
        {
          status: httpStatus.INTERNAL_SERVER_ERROR,
          title : err.title,
          error : err.message
        }
      );
  }));

router.post('/', (req, res, next) => {
  return User.find({ login: req.body.login })
    .then((results) => {
      if (results.length === 0) { // l'utilisateur n'a pas été trouvé dans la DB -> il faut l'ajouter
        const graph = req.app.get('graph');
        graph.addNode(req.body.login, req.body.login); // on ajoute un noeud dans le graph

        return new User(req.body).save()
          .then((result) => {
            res.status(httpStatus.OK)
              .send(result);
          })
          .catch(err => res.status(httpStatus.INTERNAL_SERVER_ERROR)
            .send(
              {
                status: httpStatus.INTERNAL_SERVER_ERROR,
                title : err.title,
                error : err.message
              }
            ));
      }
      // Si l'utilisateur est déjà présent dans la DB, on ne fait rien.
    });
});

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

router.put('/:username', (req, res, next) => {
  User.findOneAndUpdate({ login: req.params.username }, { visited: req.body.visited }, { new: true })
    .then((result) => {
      res.status(httpStatus.OK)
        .send(result);
    })
    .catch(err => res.status(httpStatus.INTERNAL_SERVER_ERROR)
      .send(
        {
          status: httpStatus.INTERNAL_SERVER_ERROR,
          title : err.title,
          error : err.message
        }
      ));
});

module.exports = router;
