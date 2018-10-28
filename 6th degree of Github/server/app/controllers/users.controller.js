const express = require('express');
const httpStatus = require('http-status');

const router = new express.Router();
const mongoose = require('mongoose');
require('../models/user.model');

const User = mongoose.model('User');

/**
 * Route permettant de récupérer tous les utilisateurs enregistré dans la DB.
 * Le résultat peut être filtré à l'aide des clés "login" et "visited".
 * Le résultat peut être limité à "limit" éléments.
 */
router.get('/', (req, res, next) => {
  const filter = {};
  if (req.query.login !== undefined) {
    filter.login = req.query.login;
  }
  if (req.query.visited !== undefined) {
    filter.visited = req.query.visited;
  }
  return User.find(filter)
    .limit(+req.query.limit)
    .exec()
    .then((users) => {
      res.status(httpStatus.OK)
        .send(users);
    });
});

function addUserToDB (user, graph) {
  return User.find({ login: user.login })
    .then((results) => {
      if (results.length === 0) { // l'utilisateur n'a pas été trouvé dans la DB -> il faut l'ajouter
        graph.addNode(user.login, true); // on ajoute un noeud dans le graph

        return new User(user).save();
      }
      // Si l'utilisateur est déjà présent dans la DB, on ne fait rien.
      return 0;
    });
}

/**
 * Route permettant d'ajouter un utilisateur.
 */
router.post('/', (req, res, next) => addUserToDB(req.body, req.app.get('graph'))
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
    )));

/**
 * Route permettant d'ajouter tous les utilisateurs présents dans le tableau reçu.
 */
router.post('/addallusers', (req, res, next) => {
  const graph = req.app.get('graph');

  return User.find()
    .then(results => req.body.filter(val => results.map(u => u.login)
      .indexOf(val.login) === -1)) // on supprime les doublons
    .then((filtredResults) => {
      filtredResults.forEach(user => graph.addNode(user.login, false)); // on ajoute un noeud dans le graph sans enregistrer la modification
      graph.updateGraphInDB(); // on enregistre toutes les modifications faites au graphe.
      return User.insertMany(filtredResults)
        .then(() => res.status(httpStatus.OK)
          .send(`les utilisateurs suivants ont bien été ajoutés à la base de données : ${req.body.map(u => u.login)}`))
        .catch((err) => {
          console.log(err);
          res.status(httpStatus.INTERNAL_SERVER_ERROR);
        });
    });
});


/**
 * Route permettant de modifier l'utilisateur correspondant au username reçu.
 */
router.put('/:username', (req, res, next) => User.findOneAndUpdate({ login: req.params.username }, { visited: req.body.visited }, { new: true })
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
    )));

module.exports = router;
