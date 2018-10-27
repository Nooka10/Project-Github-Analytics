const express = require('express');
const httpStatus = require('http-status');

const router = new express.Router();
const mongoose = require('mongoose');
require('../models/utils.model');

const Utils = mongoose.model('Utils');

/**
 * Route permettant de récupérer les infos de la collection utils.
 */
router.get('/', (req, res, next) => Utils.find()
  .then(users => res.status(httpStatus.OK)
    .send(users)));

router.get('/:id', (req, res, next) => Utils.findById(req.params.id)
  .then((util) => {
    if (util !== null) {
      return res.status(httpStatus.OK)
        .send(util);
    } else {
      return res.status(httpStatus.NO_CONTENT)
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

/**
 * Route permettant d'ajouter des informations dans la collection utils.
 */
router.post('/', (req, res, next) => new Utils(req.body).save()
  .then(result => res.status(httpStatus.OK)
    .send(result))
  .catch(err => res.status(httpStatus.INTERNAL_SERVER_ERROR)
    .send(
      {
        status: httpStatus.INTERNAL_SERVER_ERROR,
        title : err.title,
        error : err.message
      }
    )));

/**
 * Route permettant de modifier les informations du document correspondant à l'id reçu.
 */
router.put('/:id', (req, res, next) => Utils.findByIdAndUpdate(req.params.id, req.body, { new: true })
  .then((result) => {
    if (result !== null) {
      return res.status(httpStatus.OK)
        .send(result);
    } else {
      return res.status(httpStatus.NO_CONTENT)
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
