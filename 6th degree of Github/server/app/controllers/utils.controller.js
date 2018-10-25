const express = require('express');
const httpStatus = require('http-status');

const router = new express.Router();
const mongoose = require('mongoose');
require('../models/utils.model');

const Utils = mongoose.model('Utils');

router.get('/', (req, res, next) => Utils.find()
  .then((users) => {
    res.status(httpStatus.OK)
      .send(users);
  }));

router.get('/:id', (req, res, next) => Utils.findById(req.params.id)
  .then((util) => {
    if (util !== null) {
      res.status(httpStatus.OK)
        .send(util);
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

router.post('/', (req, res, next) => new Utils(req.body).save()
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

router.put('/:id', (req, res, next) => Utils.findByIdAndUpdate(req.params.id, req.body, { new: true })
  .then((result) => {
    if (result !== null) {
      res.status(httpStatus.OK)
        .send(result);
    } else {
      res.status(httpStatus.NO_CONTENT)
        .send();
    }
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
