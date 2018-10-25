const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    login: mongoose.Schema.Types.String,
    visited: mongoose.Schema.Types.Boolean
  },
);

mongoose.model('User', userSchema);
