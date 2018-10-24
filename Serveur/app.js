// loads environment variables
require('dotenv/config');
require('./src/models/user.model');
const express = require('express');
const cors = require('cors');
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const config = require('./config/config');
mongoose.Promise = require('bluebird');

mongoose.connect(config.db);
const User = mongoose.model('followers');

const app = express();

// Enable CORS for the client app
app.use(cors());

app.get('/followers', (req, res, next) => { // eslint-disable-line no-unused-vars
  User.find({}, (err, users) => {
    res.send(users);
  });
});

// Forward 404 to error handler
app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = httpStatus.NOT_FOUND;
  next(error);
});

// Error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err);
  res.status(err.status || httpStatus.INTERNAL_SERVER_ERROR);
  res.send(err.message);
});

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening at http://localhost:${config.port}`);
});
