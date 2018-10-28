const mongoose = require('mongoose');

const mostFollowedUserSchema = new mongoose.Schema(
  {
    avatar      : {
      type    : mongoose.Schema.Types.String,
      required: true
    },
    pseudo      : {
      type    : mongoose.Schema.Types.String,
      required: true
    },
    name        : {
      type    : mongoose.Schema.Types.String,
      required: true
    },
    nb_followers: {
      type    : mongoose.Schema.Types.Number,
      required: true
    },
    location    : {
      type    : mongoose.Schema.Types.String,
      required: true
    },
    link        : {
      type    : mongoose.Schema.Types.String,
      required: true
    }
  }
);

mongoose.model('most_followed_users', mostFollowedUserSchema);
