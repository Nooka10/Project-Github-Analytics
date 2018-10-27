const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
require('../models/followers.model');
require('../models/forks.model');
require('../models/stars.model');

const followedUserModel = mongoose.model('most_followed_users');
const starredReposModel = mongoose.model('starred_repos');
const forkedReposModel = mongoose.model('forked_repos');

router.get('/followers', (req, res, next) => { // eslint-disable-line no-unused-vars
  followedUserModel.find({}, (err, users) => {
    res.send(users);
  });
});

router.get('/stars', (req, res, next) => { // eslint-disable-line no-unused-vars
  starredReposModel.find({}, (err, users) => {
    res.send(users);
  });
});

router.get('/forks', (req, res, next) => { // eslint-disable-line no-unused-vars
  forkedReposModel.find({}, (err, users) => {
    res.send(users);
  });
});


module.exports = router;
