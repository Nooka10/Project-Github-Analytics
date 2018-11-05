const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    login  : {
      type    : mongoose.Schema.Types.String,
      required: true
    },
    visited: {
      type    : mongoose.Schema.Types.Boolean,
      required: true
    }
  }
);

mongoose.model('User', userSchema);
