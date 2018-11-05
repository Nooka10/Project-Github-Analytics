const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
require('../models/followers.model');
require('../models/forks.model');
require('../models/stars.model');

const followedUserModel = mongoose.model('most_followed_users');
const starredReposModel = mongoose.model('starred_repos');
const forkedReposModel = mongoose.model('forked_repos');

/**
 * Route permettant de récupérer les utilisateurs ayant le plus de followers.
 */
router.get('/followers', (req, res, next) => followedUserModel.find({}, (err, users) => {
  res.send(users);
}));

/**
 * Route permettant de récupérer les repos les plus starrés.
 */
router.get('/stars', (req, res, next) => starredReposModel.find({}, (err, users) => {
  res.send(users);
}));

/**
 * Route permettant de récupérer les repos les plus forkés.
 */
router.get('/forks', (req, res, next) => forkedReposModel.find({}, (err, users) => {
  res.send(users);
}));


module.exports = router;
