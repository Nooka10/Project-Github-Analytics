// loads environment variables
require('dotenv/config');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');


mongoose.connect('mongodb+srv://ouzgaga:ouzgaga@cluster0-7foch.gcp.mongodb.net/GithubAnalytics?retryWrites=true');
const app = express();
const port = 3000;

// Enable CORS for the client app
app.use(cors());

const userSchema = new mongoose.Schema({
  avatar: { type: String, required: false },
  pseudo: { type: String, required: false },
  name: { type: String, required: false },
  nb_followers: Number,
});


const User = mongoose.model('followers', userSchema);


app.get('/followers', (req, res, next) => { // eslint-disable-line no-unused-vars
  User.find({}, (err, users) => {
    res.send(users);
  });
});

// Forward 404 to error handler
app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});

// Error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err);
  res.status(err.status || 500);
  res.send(err.message);
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening at http://localhost:${port}`);
});
