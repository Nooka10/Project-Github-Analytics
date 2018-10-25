const mongoose = require('mongoose');

const mostFollowedUserSchema = new mongoose.Schema({
  avatar: { type: String, required: true },
  pseudo: { type: String, required: true },
  name: { type: String, required: true },
  nb_followers: { type: Number, required: true },
  location: { type: String, required: true },
  link: { type: String, required: true },
});

mongoose.model('most_followed_users', mostFollowedUserSchema);
