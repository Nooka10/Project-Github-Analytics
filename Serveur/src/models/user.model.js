const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    avatar: String,
    pseudo: String,
    name: String,
    nb_followers: Number,
  },
);

mongoose.model('followers', userSchema);
