const express = require('express');
const httpStatus = require('http-status');

const router = express.Router();
const mongoose = require('mongoose');
require('../models/user.model');

const User = mongoose.model('User');

router.get('/', (req, res, next) => {
  const username1 = req.query.u1;
  const username2 = req.query.u2;

  const user1 = User.find(username1)
    .exec();
  const user2 = User.find(username2)
    .exec();

  if (user1 === undefined) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR)
      .send(
        {
          status: httpStatus.INTERNAL_SERVER_ERROR,
          title : `User ${username1}not found!`,
          error : `L'utilisateur ${username1}n'est pas dans la base de données!`
        }
      );
  }
  if (user2 === undefined) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR)
      .send(
        {
          status: httpStatus.INTERNAL_SERVER_ERROR,
          title : `User ${username2}not found!`,
          error : `L'utilisateur ${username2}n'est pas dans la base de données!`
        }
      );
  }
});

module.exports = router;
