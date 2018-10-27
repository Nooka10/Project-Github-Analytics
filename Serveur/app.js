// loads environment variables
require('dotenv/config');
require('./src/models/followers.model');
require('./src/models/forks.model');
require('./src/models/stars.model');
const express = require('express');
const cors = require('cors');
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const config = require('./config/config');
mongoose.Promise = require('bluebird');

mongoose.connect(config.db);
const FollowedUserModel = mongoose.model('most_followed_users');
const StarredReposModel = mongoose.model('starred_repos');
const ForkedReposModel = mongoose.model('forked_repos');

const app = express();

// Enable CORS for the client app
app.use(cors());

app.get('/others/followers', (req, res, next) => { // eslint-disable-line no-unused-vars
  FollowedUserModel.find({}, (err, users) => {
    res.send(users);
  });
});

app.get('/others/stars', (req, res, next) => { // eslint-disable-line no-unused-vars
  StarredReposModel.find({}, (err, users) => {
    res.send(users);
  });
});

app.get('/others/forks', (req, res, next) => { // eslint-disable-line no-unused-vars
  ForkedReposModel.find({}, (err, users) => {
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
