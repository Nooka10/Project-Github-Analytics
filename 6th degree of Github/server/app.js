require('dotenv').config();
const express = require('express');
const glob = require('glob');
const mongoose = require('mongoose');
const config = require('./config/config');
mongoose.Promise = require('bluebird');

mongoose.connect(config.db, { useMongoClient: true });
const db = mongoose.connection;
db.on('error', () => {
  throw new Error(`unable to connect to database at ${config.db}`);
});

const app = express();

module.exports = require('./config/express')(app, config);

app.listen(config.port, () => {
  console.log(`Express server listening on port ${config.port}`);
});
