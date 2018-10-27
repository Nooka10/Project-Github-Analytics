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

/**
 * Route permettant de récupérer l'utilisateur ayant l'id passé en paramètre.
 */
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

/**
 * Route permettant d'ajouter un utilisateur.
 */
router.post('/', (req, res, next) => User.find({ login: req.body.login })
  .then((results) => {
    if (results.length === 0) { // l'utilisateur n'a pas été trouvé dans la DB -> il faut l'ajouter
      const graph = req.app.get('graph');
      graph.addNode(req.body.login); // on ajoute un noeud dans le graph

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
  }));

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
